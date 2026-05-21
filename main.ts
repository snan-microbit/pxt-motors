/**
 * Motors extension for the Waveshare Motor Driver board for micro:bit.
 *
 * Provides blocks to control:
 *  - 2 DC motors (Motor 1, Motor 2) with direction (forward / backward)
 *    and speed (0-100).
 *  - 3 servo channels (S0, S1, S2) supporting both 180-degree positional
 *    servos (set angle) and continuous-rotation servos (clockwise /
 *    counterclockwise + speed 0-100).
 *
 * Pin mapping (Waveshare board, based on TB6612FNG-style dual H-bridge):
 *   Motor 1 -> PWMA=P8,  AIN1=P13, AIN2=P12
 *   Motor 2 -> PWMB=P16, BIN1=P14, BIN2=P15
 *   Servo S0 -> P0
 *   Servo S1 -> P1
 *   Servo S2 -> P2
 *
 * Direction logic for the H-bridge (per motor):
 *   IN1=0, IN2=1  -> one direction (called "forward" here)
 *   IN1=1, IN2=0  -> opposite direction ("backward")
 *   IN1=0, IN2=0  -> coast / stop
 *   PWM pin sets speed (duty cycle).
 *
 * Continuous servo pulse convention:
 *   1500 us = stop
 *   1000 us = full clockwise
 *   2000 us = full counterclockwise
 *   Speed 0-100 maps the pulse from 1500 us towards the corresponding
 *   extreme. (Direction may vary depending on the specific servo model.)
 */

enum Motor {
    //% block="1"
    M1 = 1,
    //% block="2"
    M2 = 2,
}

enum ServoChannel {
    //% block="S0"
    S0 = 0,
    //% block="S1"
    S1 = 1,
    //% block="S2"
    S2 = 2,
}

enum MotorDirection {
    //% block="forward"
    Forward = 1,
    //% block="backward"
    Backward = 2,
}

enum ServoRotation {
    //% block="clockwise"
    Clockwise = 1,
    //% block="counterclockwise"
    CounterClockwise = 2,
}

//% weight=100 color=#1E88E5 icon="\uf085" block="Motors"
namespace motors {

    // --- Motor pin mapping ---
    const PWMA = AnalogPin.P8;
    const AIN1 = DigitalPin.P13;
    const AIN2 = DigitalPin.P12;
    const PWMB = AnalogPin.P16;
    const BIN1 = DigitalPin.P14;
    const BIN2 = DigitalPin.P15;

    // --- Servo pin mapping ---
    const S0_PIN = AnalogPin.P0;
    const S1_PIN = AnalogPin.P1;
    const S2_PIN = AnalogPin.P2;

    // --- Continuous servo pulse constants (microseconds) ---
    const SERVO_STOP_US = 1500;
    const SERVO_RANGE_US = 500; // +/- around stop

    /**
     * Turn a DC motor on with a given direction and speed.
     * @param motor which motor to turn on
     * @param direction direction of rotation
     * @param speed speed from 0 to 100
     */
    //% blockId=motors_motor_on
    //% block="motor %motor|direction %direction|speed %speed"
    //% speed.min=0 speed.max=100
    //% weight=100
    export function motorOn(motor: Motor, direction: MotorDirection, speed: number): void {
        const pwm = Math.map(Math.clamp(0, 100, speed), 0, 100, 0, 1023);

        if (motor == Motor.M1) {
            pins.analogWritePin(PWMA, pwm);
            if (direction == MotorDirection.Forward) {
                pins.digitalWritePin(AIN1, 0);
                pins.digitalWritePin(AIN2, 1);
            } else {
                pins.digitalWritePin(AIN1, 1);
                pins.digitalWritePin(AIN2, 0);
            }
        } else {
            pins.analogWritePin(PWMB, pwm);
            if (direction == MotorDirection.Forward) {
                pins.digitalWritePin(BIN1, 0);
                pins.digitalWritePin(BIN2, 1);
            } else {
                pins.digitalWritePin(BIN1, 1);
                pins.digitalWritePin(BIN2, 0);
            }
        }
    }

    /**
     * Turn off a DC motor (coast).
     * @param motor which motor to turn off
     */
    //% blockId=motors_motor_off
    //% block="turn off motor %motor"
    //% weight=90
    export function motorOff(motor: Motor): void {
        if (motor == Motor.M1) {
            pins.analogWritePin(PWMA, 0);
            pins.digitalWritePin(AIN1, 0);
            pins.digitalWritePin(AIN2, 0);
        } else {
            pins.analogWritePin(PWMB, 0);
            pins.digitalWritePin(BIN1, 0);
            pins.digitalWritePin(BIN2, 0);
        }
    }

    /**
     * Run a continuous-rotation servo with a given direction and speed.
     * Same shape as the DC motor block, but uses clockwise / counterclockwise.
     * @param servo which servo channel
     * @param rotation rotation sense
     * @param speed speed from 0 to 100
     */
    //% blockId=motors_servo_on
    //% block="servo %servo|direction %rotation|speed %speed"
    //% speed.min=0 speed.max=100
    //% weight=80
    export function servoOn(servo: ServoChannel, rotation: ServoRotation, speed: number): void {
        const s = Math.clamp(0, 100, speed);
        const delta = Math.map(s, 0, 100, 0, SERVO_RANGE_US);
        const pulse = rotation == ServoRotation.Clockwise
            ? SERVO_STOP_US - delta
            : SERVO_STOP_US + delta;
        writeServoPulse(servo, pulse);
    }

    /**
     * Stop a continuous-rotation servo (sends the neutral pulse).
     * @param servo which servo channel
     */
    //% blockId=motors_servo_off
    //% block="turn off servo %servo"
    //% weight=70
    export function servoOff(servo: ServoChannel): void {
        writeServoPulse(servo, SERVO_STOP_US);
    }

    /**
     * Move a 180-degree positional servo to a given angle.
     * @param servo which servo channel
     * @param angle target angle in degrees (0-180)
     */
    //% blockId=motors_servo_set_angle
    //% block="set servo %servo|to angle %angle"
    //% angle.min=0 angle.max=180
    //% weight=60
    export function servoSetAngle(servo: ServoChannel, angle: number): void {
        const a = Math.clamp(0, 180, angle);
        if (servo == ServoChannel.S0) pins.servoWritePin(S0_PIN, a);
        else if (servo == ServoChannel.S1) pins.servoWritePin(S1_PIN, a);
        else pins.servoWritePin(S2_PIN, a);
    }

    // --- Internal helpers ---

    function writeServoPulse(servo: ServoChannel, us: number): void {
        if (servo == ServoChannel.S0) pins.servoSetPulse(S0_PIN, us);
        else if (servo == ServoChannel.S1) pins.servoSetPulse(S1_PIN, us);
        else pins.servoSetPulse(S2_PIN, us);
    }
}
