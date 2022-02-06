//const converter = import('../js/dec64-floating-point-converter.js');

$(function () {
    loadExampleData();
    initDisplay();
});

function loadExampleData() {
    $('#input-significand').val('127.0');
    $('#input-exponent').val('5');
    $('#dec-preview').text('127.0x10');
    $('#exp-preview').text('5');
    $('#round-1').prop("checked", true);
    computeOutput();
    maskOutput();
}

function initDisplay() {
    $('#input-significand').keyup(function () {
        $('#dec-preview').text(getSignificand());
        $('#exp-preview').text(getExponent());
        computeOutput();
        maskOutput();
    });

    $('#input-exponent').keyup(function () {
        $('#dec-preview').text(getSignificand());
        $('#exp-preview').text(getExponent());
        computeOutput();
        maskOutput();
    });
}

function validateInput() {
    if (!isNaN($('#input-significand').val()) && !isNaN($('#input-exponent').val()))
        return true;
    else if ($('#input-significand').val() === 'NaN')
        return true;
    return false;
}

function computeOutput() {
    if (validateInput()) {
        let decimal64Format = decimalToDec64Float($('#input-significand').val(), $('#input-exponent').val());

        console.log(decimal64Format.coefficientContinuation.join(''))

        $('#binary-output').val(
            decimal64Format.signBit +
            decimal64Format.combinationField +
            decimal64Format.exponentContinuation +
            decimal64Format.coefficientContinuation.join(''))
        $('#binary-output-sign').val(decimal64Format.signBit);
        $('#binary-output-comb').val(decimal64Format.combinationField);
        $('#binary-output-expo').val(decimal64Format.exponentContinuation);
        $('#binary-output-coef').val(decimal64Format.coefficientContinuation.join(''));
        $('#hex-output').val(decimal64Format.hex);

    }
    else {
        $('#binary-output-sign').val('');
        $('#binary-output-comb').val('');
        $('#binary-output-expo').val('');
        $('#binary-output-coef').val('');
        $('#hex-output').val('');
    }
}

function maskOutput() {
    $('#binary-output-comb').unmask();
    $('#binary-output-expo').unmask();
    $('#binary-output-coef').unmask();
    $('#binary-output-comb').mask('00 000');
    $('#binary-output-expo').mask('0000 0000');
    $('#binary-output-coef').mask('0000000000 0000000000 0000000000 0000000000 0000000000');
}

function getSignificand() {
    if ($('#input-significand').val() === '')
        return '_____';
    else if (!isNaN($('#input-significand').val()))
        return $('#input-significand').val() + 'x10';
    else if ($('#input-significand').val() === 'NaN')
        return 'NaN';
    return '_____';
}

function getExponent() {
    if ($('#input-significand').val() === 'NaN')
        return '';
    else if (!isNaN($('#input-exponent').val()))
        return $('#input-exponent').val();
    else if ($('#input-exponent').val() === '')
        return '__';
    return '__';
}

function copyToClipboard(opt) {
    if (validateInput()) {
        let text = document.getElementById('hex-output');
        if (opt === 'BIN')
            text = document.getElementById('binary-output');

        text.select();

        navigator.clipboard.writeText(text.value);
    }
}