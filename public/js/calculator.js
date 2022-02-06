$(function() {
    loadExampleData();
    initValidation();

    $('#binary-output-sign').val('1');
    $('#binary-output-expo').val('11010010');
    $('#binary-output-expo').mask('0000 0000');
    $('#binary-output-frac').val('1000100010001000100010001000100');
    $('#binary-output-frac').mask('000 0000 0000 0000 0000 0000 0000 0000');
});

function loadExampleData() {
    $('#input-significand').val('127.0');
    $('#input-exponent').val('5');
    $('#dec-preview').text('127.0x10');
    $('#exp-preview').text('5');
    $('#round-1').prop("checked", true);
}

function initValidation() {
    $('#input-significand').keyup(function() {
        $('#dec-preview').text(getSignificand());
        $('#exp-preview').text(getExponent());
    });

    $('#input-significand').change(function () {
        $('#dec-preview').text(getSignificand());
        $('#exp-preview').text(getExponent());
    });

    $('#input-exponent').keyup(function () {
        $('#dec-preview').text(getSignificand());
        $('#exp-preview').text(getExponent());
    });

    $('#input-exponent').change(function () {
        $('#dec-preview').text(getSignificand());
        $('#exp-preview').text(getExponent());
    });
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