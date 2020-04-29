require('dotenv').config()

const Sequelize = require('sequelize')

const constants = require('./constants')
const models = require('./models')

const notes = require('../data/notes')
const scaleDefinitions = require('../data/scaleDefinitions')

const run = async ({
  constants,
  models,
  notes,
  scaleDefinitions,
  Sequelize
}) => {
  const sequelize = new Sequelize(
    constants.db.database,
    constants.db.username,
    constants.db.password,
    {
      host: constants.db.host,
      dialect: constants.db.dialect
    }
  )
  try {
    // Create tables from models
    const Scale = models.scale(sequelize, Sequelize.DataTypes)
    const ScaleDefinition = models.scaleDefinition(
      sequelize,
      Sequelize.DataTypes
    )
    Scale.associate(sequelize.models)

    await sequelize.sync({ force: true })

    // Populate the scale definitions
    const scaleDefinitionsTransaction = await sequelize.transaction({
      autocommit: false
    })
    const scaleDefinitionInstances = await Promise.all(
      scaleDefinitions.map(async scaleDefinition => {
        const distances = scaleDefinition.intervals.reduce(
          (distances, interval) => {
            const distance = interval + distances[distances.length - 1]
            return distances.concat(distance)
          },
          [0]
        )
        const scaleDefinitionInstance = await ScaleDefinition.create(
          {
            name: scaleDefinition.name,
            intervals: scaleDefinition.intervals,
            distances,
            modes: scaleDefinition.modes
          },
          { transaction: scaleDefinitionsTransaction }
        )
        return {
          ...scaleDefinition,
          id: scaleDefinitionInstance.id,
          distances
        }
      })
    )
    const scaleDefinitionsCommit = await scaleDefinitionsTransaction.commit()

    // Populate the scales
    const scaleModeDefinitions = scaleDefinitionInstances.reduce(
      (all, scaleDefinition) => {
        const modes = scaleDefinition.modes.map((mode, index) => {
          return {
            name: mode,
            intervals: scaleDefinition.intervals
              .slice(index, scaleDefinition.intervals.length - 1)
              .concat(scaleDefinition.intervals.slice(0, index)),
            distances: scaleDefinition.distances
              .slice(index, scaleDefinition.distances.length - 1)
              .concat(scaleDefinition.distances.slice(0, index))
          }
        })
        return all.concat({ scale: scaleDefinition.id, modes })
      },
      []
    )

    const scaleInstances = await Promise.all(
      notes.map(async note => {
        // Create all note scales
        const noteScaleInstances = await Promise.all(
          scaleModeDefinitions.map(async scaleMode => {
            // Get the tonic mode first
            const scaleOf = scaleMode.scale
            const tonicModeNumber = 0
            const tonic = note.number
            const tonicMode = scaleMode.modes[tonicModeNumber]
            const tonicNotes = tonicMode.distances.map(
              distance => (distance + tonic) % 12
            )
            const tonicName = `${
              note.names.natural ? note.names.natural : note.names.sharp
            } ${tonicMode.name}`

            const tonicInstance = await Scale.create({
              name: tonicName,
              tonic,
              notes: tonicNotes,
              modeNumber: tonicModeNumber,
              scaleOf
            })
            const modeOf = tonicInstance.id
            tonicInstance.modeOf = tonicInstance.id
            await tonicInstance.save()

            const modesOfScale = scaleMode.modes.slice(
              1,
              scaleMode.modes.length
            )

            // Create the modes for this tonic scale
            const modeTransaction = await sequelize.transaction({
              autocommit: false
            })
            const modeInstances = await Promise.all(
              modesOfScale.map(async (mode, index) => {
                const modeNumber = index
                const modeNotes = mode.distances.map(
                  distance => (distance + tonic) % 12
                )
                const modeTonic = modeNotes[0]
                const modeTonicNote = notes[modeTonic]
                const modeName = `${
                  modeTonicNote.names.natural
                    ? modeTonicNote.names.natural
                    : modeTonicNote.names.sharp
                } ${mode.name}`
                const modeInstance = await Scale.create(
                  {
                    name: modeName,
                    tonic: modeTonic,
                    notes: modeNotes,
                    modeNumber: modeNumber + 1,
                    modeOf,
                    scaleOf
                  },
                  { transaction: modeTransaction }
                )
                return modeInstance
              })
            )
            const modeCommit = await modeTransaction.commit()
          })
        )
      })
    )
  } catch (error) {
    console.log(error)
  } finally {
    sequelize.close()
  }
}

run({ constants, models, notes, scaleDefinitions, Sequelize })
