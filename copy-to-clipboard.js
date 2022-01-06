function copyToClipboard() {
    var copyText = document.getElementById('<id>');
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    //https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
  }