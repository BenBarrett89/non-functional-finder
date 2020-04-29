# non-functional-finder

> An application to help find common scales/modes for help in creating non-functional harmony

## Feature Ideas

- Similar to [ScalesChords Scale Finder](https://www.scales-chords.com/scalefinder.php)

- Select a scale, mode or a number of notes - any other scales or modes that share notes are returned

  - These can be filtered or sorted
    - By the number of matched notes (range)
    - By whether they contain specific notes
    - By whether they are modes the same key (will contain _all_ the same notes, so are less useful) - perhaps display these separately?
    - By the distance of their root from the selected scale
      - In semitones
      - In circle of fifths distance
    - By function of shared notes?

- Given a number of selected scales - find scales that are most likely to be used over both/all i.e given the shared notes, which scale is most strongly suited for this?

## Running

- Create database
- Enable `intarray` extension
- Load database
- Run API
- Run app
- Use app
