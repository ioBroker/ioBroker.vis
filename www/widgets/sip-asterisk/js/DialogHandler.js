
(function() {
    var cancelButton = document.getElementById('cancel');
    var accountDataDialog = document.getElementById('accountDataDialog');

    // Update button opens a modal dialog
    updateButton.addEventListener('click', function() {
        favDialog.showModal();
    });

    // Form cancel button closes the dialog box
    cancelButton.addEventListener('click', function() {
        favDialog.close();
    });

})();
