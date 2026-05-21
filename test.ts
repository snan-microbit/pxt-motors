// Quick smoke test of every block in the extension.
// Use this as a starting point in MakeCode to verify wiring and behavior.

// --- DC motors ---
input.onButtonPressed(Button.A, function () {
    motors.motorOn(Motor.M1, MotorDirection.Forward, 50);
    basic.pause(1000);
    motors.motorOff(Motor.M1);
});

input.onButtonPressed(Button.B, function () {
    motors.motorOn(Motor.M2, MotorDirection.Backward, 75);
    basic.pause(1000);
    motors.motorOff(Motor.M2);
});

// --- Continuous-rotation servo ---
input.onButtonPressed(Button.AB, function () {
    motors.servoOn(ServoChannel.S0, ServoRotation.Clockwise, 100);
    basic.pause(2000);
    motors.servoOff(ServoChannel.S0);
});

// --- 180-degree positional servo ---
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    motors.servoSetAngle(ServoChannel.S1, 0);
    basic.pause(500);
    motors.servoSetAngle(ServoChannel.S1, 90);
    basic.pause(500);
    motors.servoSetAngle(ServoChannel.S1, 180);
});
