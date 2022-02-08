if (typeof window == 'undefined') {
    var decToDenselyPackedBCD = require('./decimal-dense-bcd.js');
}

const EXPONENT_BIAS = 398;

// DEFAULT (1 = Truncation, 2 = Ceiling, 3 = Floor, 4 = Ties to Zero, 5 = Ties to Even)
const ROUNDOFF_DEF = 1;

/**
 * Converts decimal input to its corresponding decimal64 floating point representation
 * based on IEEE-754 2008 standard
 */
function decimalToDec64Float(decimal, exponent, roundOffMethod) {
    if (typeof decimal != 'number' && typeof decimal != 'string')
        throw 'param must either be num or string';
    if (typeof decimal == 'string' && Number.isNaN(Number(decimal)))
        return getNaNRepresentation();

    const normalizedDecimal =
        typeof decimal == 'number'
            ? normalizeDecimal(String(decimal))
            : normalizeDecimal(decimal);

    if (getNumberOfDigits(String(decimal)) > 16) {
        var normalizedExponent =
            exponent - calculateFloatDisplacement(normalizeDecimal);
    } else {
        var normalizedExponent =
            exponent - calculateFloatDisplacement(String(decimal)); // right: subtract; left: add
    }

    roundedDecimal = String(
        getRoundedOffNum(decimal, normalizedDecimal, roundOffMethod)
    );

    // console.log('normalized:', roundedDecimal);

    // const normalizedExponent =
    //     exponent - calculateFloatDisplacement(String(decimal)); // right: subtract; left: add
    const exponentBias = normalizedExponent + EXPONENT_BIAS;
    // console.log(normalizedExponent);
    if (normalizedExponent > 384)
        return getInfinityRepresentation(roundedDecimal);

    const signBit = getSignBit(roundedDecimal);
    const combinationField = getCombinationField(roundedDecimal, exponentBias);
    const exponentContinuation = getExponentContinuation(exponentBias);
    const coefficientContinuation = getCoefficientContinuation(roundedDecimal);

    const binary1 =
        (signBit + combinationField + exponentContinuation).toString() +
        coefficientContinuation.toString().toString().substring(0, 2);
    const binary2 = coefficientContinuation
        .toString()
        .substring(2)
        .split(',')
        .join('');

    const hex1 = parseInt(binary1, 2)
        .toString(16)
        .toUpperCase()
        .padStart(4, '0');
    const hex2 = parseInt(binary2, 2)
        .toString(16)
        .toUpperCase()
        .padStart(12, '0');

    const decimal64Format = {
        signBit: signBit,
        combinationField: combinationField,
        exponentContinuation: exponentContinuation,
        coefficientContinuation: coefficientContinuation,
        hex: hex1 + hex2,
    };
    // console.log(decimal64Format);
    return decimal64Format;
}

function getNaNRepresentation() {
    return {
        //quiet
        signBit: '0',
        combinationField: '11111',
        exponentContinuation: '00000000',
        coefficientContinuation: [
            '0000000000',
            '0000000000',
            '0000000000',
            '0000000000',
            '0000000000',
        ],
        hex: '7FF8000000000000',
    };
}

function getInfinityRepresentation(decimal) {
    if (decimal < 0) {
        return {
            signBit: '1',
            combinationField: '11110',
            exponentContinuation: '00000000',
            coefficientContinuation: [
                '0000000000',
                '0000000000',
                '0000000000',
                '0000000000',
                '0000000000',
            ],
            hex: '7FF0000000000000',
        };
    } else
        return {
            signBit: '0',
            combinationField: '11110',
            exponentContinuation: '00000000',
            coefficientContinuation: [
                '0000000000',
                '0000000000',
                '0000000000',
                '0000000000',
                '0000000000',
            ],
            hex: 'FFF0000000000000',
        };
}

function getSignBit(decimal) {
    const num = Number(decimal);
    return num >= 0 ? 0 : 1;
}

function getCombinationField(decimal, exponent) {
    // Remove negative sign to get the first character digit
    const MSD =
        decimal.charAt(0) == '-' ? decimal.charAt(1) : decimal.charAt(0);
    // Transform msd to binary
    const binaryMSD = Number(MSD).toString(2).padStart(4, '0');
    // Transform expononent to binary
    const binaryExponent = exponent.toString(2).padStart(10, '0');

    if (Number(MSD) <= 7) {
        //abcde
        //ad 0cde
        return `${binaryExponent.substring(0, 2)}${binaryMSD.substring(1)}`;
    } else {
        //11cde
        //cd 100e
        return `11${binaryExponent.substring(0, 2)}${binaryMSD.substring(3)}`;
    }
}

function normalizeDecimal(decimal) {
    // Remove negative sign
    //let normalized = Math.abs(decimal);   // Math.abs automatically rounds numbers above >16 so it's changed to the code below
    let normalized = String(decimal).includes('-')
        ? String(decimal).slice(1)
        : String(decimal);
    // Remove radix point and start padding 0s if necessary
    normalized = String(normalized).replace('.', '').padStart(16, '0');

    //normalize number greater 16 digits
    if (normalized.length > 16) {
        normalized =
            normalized.slice(0, 16) +
            '.' +
            normalized.slice(16 - normalized.length);
    }
    // Add negative sign back
    normalized = decimal >= 0 ? normalized : `-${normalized}`;

    return normalized;
}

function getExponentContinuation(exponent) {
    return exponent.toString(2).padStart(10, '0').substring(2);
}

function getCoefficientContinuation(decimal) {
    const last15 = decimal.slice(-15);

    const partitionedLast15 = last15.match(/.{1,3}/g);
    const partitionedDPD = partitionedLast15.map((threeDigits) =>
        decToDenselyPackedBCD(threeDigits)
    );
    return partitionedDPD;
}

function calculateFloatDisplacement(decimal) {
    let [beforeRadixPoint, afterRadixPoint] = String(decimal).split('.');
    beforeRadixPoint =
        beforeRadixPoint.charAt(0) == '-'
            ? beforeRadixPoint.substring(1)
            : beforeRadixPoint;

    // Check if decimal only contains 0
    if (/^0*$/.test(afterRadixPoint)) afterRadixPoint = undefined;

    if (afterRadixPoint == undefined) {
        // Check if wholenumber is greater than 16
        if (beforeRadixPoint.length > 16) return beforeRadixPoint.length - 16;
        return 0;
    } else {
        // Check if wholenumber is greater than 16 but has decimal
        //if (beforeRadixPoint.length > 16) return beforeRadixPoint.length - 16 + afterRadixPoint.length;
        if (beforeRadixPoint.length > 16) return 16 - beforeRadixPoint.length; // e.g. 123456789123456789.123 = 1234567891234567.89123
        if (beforeRadixPoint.length == 16) return 0; // e.g. 1234567891234567.89
        if (
            beforeRadixPoint.length < 16 &&
            beforeRadixPoint.length + afterRadixPoint.length >= 16
        )
            return 16 - beforeRadixPoint.length; // e.g. 123.456789123456789123 or 12345.6789123456789
    }

    // if (afterRadixPoint == undefined) return 0;

    return afterRadixPoint.length; // e.g. 123.456
}

function getRoundedOffNum(decimal, normalized, method) {
    let roundedNumber;
    const decTrunc = Math.trunc(normalized);
    const decCeil = Math.ceil(normalized);
    const decFloor = Math.floor(normalized);

    switch (method) {
        case 'Truncation':
            roundedNumber = decTrunc;
            break;
        case 'Round-up or Ceiling':
            roundedNumber = decCeil;
            break;
        case 'Round-down or Floor':
            roundedNumber = decFloor;
            break;
        case 'Ties away from Zero':
            roundedNumber = getTiesAwayFromZero(normalized);
            break;
        case 'Ties to Even':
            roundedNumber = getTiesToEven(normalized);
            break;
    }

    if (String(roundedNumber).includes('-')) {
        return `-${String(roundedNumber).slice(1).padStart(16, 0)}`;
    }

    return String(roundedNumber).padStart(16, '0');
}

function getTiesAwayFromZero(normalized) {
    return normalized > 0 ? Math.ceil(normalized) : Math.floor(normalized);
}

function getTiesToEven(normalized) {
    const [whole, fraction] = normalized.split('.');
    if (fraction == undefined) return normalized;

    if (`0.${fraction}` == 0.5) {
        const nextNumber = Number(whole) > 0 ? whole + 1 : whole - 1;
        const isNextEven = nextNumber % 2 == 0;

        return isNextEven ? nextNumber : whole;
    } else {
        return Math.round(normalized);
    }
}

function getNumberOfDigits(decimal) {
    let digits = String(decimal).includes('-')
        ? String(decimal).slice(1, String(decimal).length)
        : String(decimal);

    digits = digits.replace('.', '');
    return digits.length;
}

// Negative exponent
//console.log(decimalToDec64Float('9876543210123456', -200));
//console.log(decimalToDec64Float('1357924680876987', -10));

// -18.4
//console.log(decimalToDec64Float('-813411111111111111.0001', 0));

// 20.8
//console.log(decimalToDec64Float('41231234123412341234.12345678', 0));     //4123123412341234|1234.12345678

// 18.1
//console.log (decimalToDec64Float('123456789123456789.1', 5));

// 16.3
//console.log(decimalToDec64Float('7123654123675431.123', 15));

// 14.2
//console.log (decimalToDec64Float('12345678912345.67', 5));

// 12
//console.log(decimalToDec64Float('123456789123', 5));

// 16
//console.log(decimalToDec64Float('1234567891234567', 5));

// 22 X
//console.log(decimalToDec64Float('1234567891234567891234', 5));

// console.log(decimalToDec64Float('1234567890123459', 0));

decimalToDec64Float('1', 0);
