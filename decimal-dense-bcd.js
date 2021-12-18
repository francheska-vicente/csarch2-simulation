/**
 * Converts a given decimal digit to the corresponding densely-packed BCD representation
 * Only accepts 3-digit or less decimal number
 * @param {Number|String} decimal decimal number to be converted to densely-packed BCD
 * @returns {String} densely-packed BCD equivalent of the given decimal number
 */
function decToDenselyPackedBCD(decimal) {
    if (typeof decimal != 'number' && typeof decimal != 'string')
        throw 'param must either be num or string';
    if (typeof decimal == 'string' && Number.isNaN(Number(decimal)))
        throw 'string must be integer convertible';

    if (decimal > 999) throw 'only pass at most triple digit';

    const packedBCD = convertToPackedBCD(decimal).padStart(12, '0');
    const denselyPackedBCD = convertToDenselyPackedBCD(packedBCD);

    return denselyPackedBCD;
}

/**
 * Converts binary digits into its densely-packed BCD equivalent
 * @param {String} packedBCD binary number to be converted to packed BCD
 * @returns {String} a string representing the packed BCD equaivalent of the given array of binary digits
 */
function convertToDenselyPackedBCD(packedBCD) {
    if (typeof packedBCD != 'number' && typeof packedBCD != 'string')
        throw 'param must either be num or string';
    if (typeof packedBCD == 'string' && Number.isNaN(Number(packedBCD)))
        throw 'string must be integer convertible';

    const encodingTable = {
        '000': 'bcdfgh0jkm',
        '001': 'bcdfgh100m',
        '010': 'bcd10h111m',
        '011': 'bcd10h111m',
        100: 'jkdfgh110m',
        101: 'fgd01h111m',
        110: 'jkd00h111m',
        111: '00d11h111m',
    };

    const encodingIndex = 
        `${getBinaryDigitFromLetter('a')}${getBinaryDigitFromLetter('e')}${getBinaryDigitFromLetter('i')}`; // prettier-ignore
    const encodingFormat = encodingTable[encodingIndex];

    const denselyPackedBCD = [...encodingFormat].reduce(
        (previousResult, currentLetter) => {
            if (currentLetter == 0 || currentLetter == 1) {
                return `${previousResult}${currentLetter}`;
            }
            return `${previousResult}${getBinaryDigitFromLetter(currentLetter)}`; // prettier-ignore
        },
        ''
    );
    return denselyPackedBCD;

    /**
     * Gets the associated binary digit based on the letter position
     * Letter positions is based on Binary coded decimal slide for week3a
     * @param {String} letter the letter to get the associated binary digit from
     * @returns {String} representing the binary digit from the specified letter position
     */
    function getBinaryDigitFromLetter(letter) {
        const bcdParam =
            typeof packedBCD == 'number' ? String(packedBCD) : packedBCD;
        const bcdArray = bcdParam.split('');

        if (![...'abcdefghijkm'].some((srcLetter) => srcLetter == letter))
            throw 'invalid letter position';

        const offset = letter == 'm' ? 98 : 97;
        return bcdArray[letter.charCodeAt(0) - offset];
    }
}

/**
 * Converts specified number into its packed BCD equivalent
 * @param {Number|String} num number in decimal to be converted to packed bcd
 * @returns {String} the packed bcd equivalent of the number
 */
function convertToPackedBCD(num) {
    const numParam = typeof num == 'number' ? String(num) : num;

    const digits = numParam.split('');
    const bcd = digits.reduce((previousResult, currentDigit) => {
        const binary = Number(currentDigit).toString(2);
        const paddedBinary = binary.padStart(4, '0');
        return `${previousResult}${paddedBinary}`;
    }, '');

    return bcd.trim();
}

console.log(decToDenselyPackedBCD('532'));
