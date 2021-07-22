const keyState: { [key: string]: boolean } = {};

export default class KeyboardInput
{
    isPressed(key: string): boolean
    {
        return keyState[key] ?? false;
    }

    setup()
    {
        window.addEventListener("keydown", e => keyState[e.key] = true);
        window.addEventListener("keyup", e => keyState[e.key] = false);
    }
}
