# pxt-motores

MakeCode extension for the **Waveshare Motor Driver** board for BBC micro:bit.
Provides simple blocks to control 2 DC motors and 3 servo channels (positional
or continuous-rotation).

Developed at **Plan Ceibal** (Uruguay) for use in the micro:bit program.

## Features

- 2 DC motors with direction (forward / backward) and speed (0–100).
- 3 servo channels supporting:
  - 180° positional servos (set angle 0–180).
  - Continuous-rotation servos (clockwise / counterclockwise + speed 0–100).
- Bilingual blocks: English (default) with full Spanish translation.

## Blocks

```blocks
// DC motor
motors.motorOn(Motor.M1, MotorDirection.Forward, 50)
motors.motorOff(Motor.M1)

// Continuous-rotation servo
motors.servoOn(ServoChannel.S0, ServoRotation.Clockwise, 75)
motors.servoOff(ServoChannel.S0)

// 180-degree positional servo
motors.servoSetAngle(ServoChannel.S1, 90)
```

## Pin map (Waveshare Motor Driver board)

| Channel  | PWM       | Direction pins   |
|----------|-----------|------------------|
| Motor 1  | P8        | P13, P12         |
| Motor 2  | P16       | P14, P15         |
| Servo S0 | P0        | —                |
| Servo S1 | P1        | —                |
| Servo S2 | P2        | —                |

## How to use in MakeCode

1. Open [makecode.microbit.org](https://makecode.microbit.org).
2. Click the gear icon → **Extensions**.
3. Paste the URL of this repository in the search box and press Enter.
4. The **Motors** category will appear in the block toolbox.

## Notes on continuous-rotation servos

The pulse convention used is:

- 1500 µs → stop
- 1000 µs → full clockwise
- 2000 µs → full counterclockwise

Whether "clockwise" maps to the direction you expect depends on how the servo
is mounted. If your servo turns the opposite way, swap the direction in the
block.

## License

MIT — see `LICENSE`.

## Supported targets

- `microbit`
