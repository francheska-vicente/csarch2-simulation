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

    $('input[name="rounding"]').change(function () {
        $('#rom-preview').text($('input[name="rounding"]:checked').siblings('label').text());
        computeOutput();
        maskOutput();
    });
}

function validateInput() {
    if (!isNaN($('#input-significand').val()) && !isNaN($('#input-exponent').val()))
        return true;
    return false;
}

function computeOutput() {
    if (validateInput()) {
        let decimal64Format = decimalToDec64Float($('#input-significand').val(), 
                                                    $('#input-exponent').val(),
            $('input[name="rounding"]:checked').siblings('label').text());

        $('#binary-output').val(
            decimal64Format.signBit +
            decimal64Format.combinationField +
            decimal64Format.exponentContinuation +
            decimal64Format.coefficientContinuation.join(''));
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
    $('#binary-output-expo').mask('AAAA AAAA');
    $('#binary-output-coef').mask('AAAAAAAAAA AAAAAAAAAA AAAAAAAAAA AAAAAAAAAA AAAAAAAAAA');
}

function getSignificand() {
    if ($('#input-significand').val() === '')
        return '_____';
    else if (!isNaN($('#input-significand').val()))
        return $('#input-significand').val() + 'x10';
    return 'NaN';
}

function getExponent() {
    if (!isNaN($('#input-significand').val())) {
        if ($('#input-exponent').val() != '') 
            return $('#input-exponent').val();
        return '__';
    }
    return '';   
}

function copyToClipboard(opt) {
    if (validateInput()) {
        let text = document.getElementById('hex-output');
        let button = $('#hex-copy');
        if (opt === 'BIN') {
            text = document.getElementById('binary-output');
            button = $('#binary-copy');
        }
            
        text.select();
        navigator.clipboard.writeText(text.value);
    }
}