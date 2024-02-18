function isSerializable(x) {
    try {
        return !!structuredClone(x);
    } catch (e) {
        return false;
    }
}

export {isSerializable};