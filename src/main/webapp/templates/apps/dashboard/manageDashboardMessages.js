function initManageDashboardMessage() {
	initHtmlEditors(jQuery('#message-template'), getStandardEditorHeight() - 100, null);

	$('#frm-message').forms({
		callback: function(resp) {
			log('done save', resp);
			alert('Saved');
		}
	});

	$('.btn-cancel').on('click', function (e) {
		e.preventDefault();

		window.location.reload();
	});
}