# The Game of Chess

This is a web chess game made with React.

## Instructions

Visit this [github pages link](https://samlhk.github.io/chess/) to play the game.

Note: Currently does not support touchscreens or Safari. The engine runs in the frontend with javascript, so performance and play speed may vary with different devices.

## Modes

### Head to Head

Two players play against each other. Drag pieces to make moves.

### Competitive

Play against a chess engine created with this project. Choose your colour and play on your turn.


## Features

### Engine

+ minimax algorithm with depth of 5
+ evaluation primarily based on piece values
+ opening and endgame bonus: bonus weights for pieces in advantageous positions *(example: knights towards the center in the opening and kings towards the center in the endgame)*
+ checkmate mode: engine finds the fastest mate when checkmate is possible

### Gameplay

+ Legal move indication and enforcement
+ Status detection: check, checkmate, stalemate, insufficient material

### Chess

+ Castling
+ En passant
+ Pawn promotion with choice
