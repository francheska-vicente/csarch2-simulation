//TODO: change require to import when in browser
const decToDenselyPackedBCD = require('./decimal-dense-bcd');

const EXPONENT_BIAS = 398;

/**
 * Converts decimal input to its corresponding decimal64 floating point representation
 * based on IEEE-754 2008 standard
 */
function decimalToDec64Float(decimal, exponent) {
    if (typeof decimal != 'number' && typeof decimal != 'string')
        throw 'param must either be num or string';
    if (typeof decimal == 'string' && Number.isNaN(Number(decimal)))
        return getNaNRepresentation();

    const normalizedDecimal =
        typeof decimal == 'number'
            ? normalizeDecimal(String(decimal))
            : normalizeDecimal(decimal);

    const normalizedExponent = exponent - calculateFloatDisplacement(decimal);
    const exponentBias = normalizedExponent + EXPONENT_BIAS;

    if (normalizedExponent > 384 || normalizedExponent < -383)
        return getInfinityRepresentation(normalizedExponent);

    const signBit = getSignBit(normalizedDecimal)
    const combinationField = getCombinationField(normalizedDecimal, exponentBias)
    const exponentContinuation = getExponentContinuation(exponentBias)
    const coefficientContinuation = getCoefficientContinuation(normalizedDecimal)

    const binary1 =   (signBit+combinationField+exponentContinuation).toString()+coefficientContinuation.toString().toString().substring(0,2)
    const binary2 =   coefficientContinuation.toString().substring(2).split(',').join('');

    const hex1 = parseInt(binary1, 2).toString(16).toUpperCase().padStart(4, '0');
    const hex2 = parseInt(binary2, 2).toString(16).toUpperCase().padStart(12, '0');

    const decimal64Format = {
        signBit: signBit,
        combinationField: combinationField,
        exponentContinuation: exponentContinuation,
        coefficientContinuation: coefficientContinuation,
        hex: hex1+hex2,
    };

    return decimal64Format;
}

function getNaNRepresentation() {
    return {
        signaling: {
            signBit: 'X',
            combinationField: '11111',
            exponentContinuation: '1XXXXXXX',
            coefficientContinuation: [
                'XXXXXXXXXX',
                'XXXXXXXXXX',
                'XXXXXXXXXX',
                'XXXXXXXXXX',
                'XXXXXXXXXX',
            ],
        },
        quiet: {
            signBit: 'X',
            combinationField: '11111',
            exponentContinuation: 'XXXXXXXX',
            coefficientContinuation: [
                'XXXXXXXXXX',
                'XXXXXXXXXX',
                'XXXXXXXXXX',
                'XXXXXXXXXX',
                'XXXXXXXXXX',
            ],
        },
    };
}

function getInfinityRepresentation(exponent) {
    if (exponent < 0) {
        return {
            signBit: '1',
            combinationField: '11110',
            exponentContinuation: 'XXXXXXXX',
            coefficientContinuation: [
                'XXXXXXXXXX',
                'XXXXXXXXXX',
                'XXXXXXXXXX',
                'XXXXXXXXXX',
                'XXXXXXXXXX',
            ],
        };
    } else
        return {
            positive: {
                signBit: '0',
                combinationField: '11110',
                exponentContinuation: 'XXXXXXXX',
                coefficientContinuation: [
                    'XXXXXXXXXX',
                    'XXXXXXXXXX',
                    'XXXXXXXXXX',
                    'XXXXXXXXXX',
                    'XXXXXXXXXX',
                ],
            },
        };
}

function getSignBit(decimal) {
    const num = Number(decimal);
    return num >= 0 ? 0 : 1;
}

function getCombinationField(decimal, exponent) {
    //remove negative sign to get the first character digit
    const MSD =
        decimal.charAt(0) == '-' ? decimal.charAt(1) : decimal.charAt(0);
    //transform msd to binary
    const binaryMSD = Number(MSD).toString(2).padStart(4, '0');
    //transform expononent to binary
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
    //remove negative sign
    let normalized = Math.abs(decimal);
    //remove radix point and start padding 0s if necessary
    normalized = String(normalized).replace('.', '').padStart(16, '0');
    //add negative sign back
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
    const [_, afterRadixPoint] = String(decimal).split('.');
    if (afterRadixPoint == undefined) return 0;

    return afterRadixPoint.length;
}

// console.log(decimalToDec64Float(9876543210123456, -200));

// console.log(decimalToDec64Float(1357924680876987, -10));

// console.log(decimalToDec64Float(4.0, 0));

console.log(decimalToDec64Float(-8134, 0));