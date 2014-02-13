function initManageFiles() {
	initPublishingMenu('');
	initFiles();
	initImport();
	initCRUDPages();
	initAddPageModal();
    initCRUDFiles();
}

function initImport() {
	var modal = $('#modal-import');

	$('.btn-show-import').on('click', function(e) {
		e.preventDefault();

		modal.modal('show');
	});

	modal.find('form').forms({
		callback: function(resp) {
			log('resp', resp);
			alert('The importer is running')
		}
	});

	$('.btn-import-status').on('click', function(e) {
		e.preventDefault();

		$.getJSON(window.location.pathname + '?importStatus', function(data) {
			$('#import-status-result').val(data.messages).show(300);
		});
	});
}

function initCRUDPages() {
    var pageList = $('#page-list');    
    
    pageList.on('click', '.btn-edit-page', function(e) {
        e.preventDefault();
        log('click edit page', e, this);
        var a = $(this);
        var name = a.attr('href');
        var article = a.closest('article');
        showEditModal(name, article);
    });
    
    pageList.on('click', '.btn-delete-page', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var target = $(this);
        var href = target.attr('href');
        log('click delete. href', href);
        var name = getFileName(href);
        var article = target.closest('article');
        confirmDelete(href, name, function() {
            log('deleted', article);
            article.remove();
            alert('Deleted ' + name);
        });
    });
}

function initCRUDFiles() {    
    $('#my-upload').mupload({
        url: window.location.pathname,
        buttonText: 'Upload a file',
        oncomplete: function(data, name, href) {
            // reload the file list
            log('uploaded ok, now reload file list');
            reloadFileList();
        }
    });
    
    $('.btn-create-folder').click(function(e) {
        e.stopPropagation();
        e.preventDefault();        
        var parentHref = window.location.pathname;
        showCreateFolder(parentHref, 'New folder', 'Please enter a name for the new folder', function() {
            reloadFileList();
        });
    });
    
    $('.btn-upload-file').click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('#modal-upload').modal('show');
    });
    
    $('.importFromUrl').click(function(e) {
        e.stopPropagation();
        e.preventDefault();                
        showImportFromUrl();
    });
}

function reloadFileList() {
    $.get(window.location.pathname, '', function(resp) {
        log('got file list', resp);
        var html = $(resp);
        $('#table-files').replaceWith(html.find('#table-files'));
        initPseudoClasses();
        initFiles();
    });
}

function initFiles() {
	var fileTable = $('#files');

    log('initFiles');
	fileTable.find('a.show-color-box').each(function(i, n) {
        var href = $(n).attr('href');
        $(n).attr('href', href + '/alt-640-360.png');
    });
    $('abbr.timeago').timeago();

	fileTable.on('click', '.btn-delete-file', function (e) {
		e.preventDefault();

		var target = $(this);
		var href = target.attr('href');
		log('click delete. href', href);
		var name = getFileName(href);
		var tr = target.closest('tr');
		confirmDelete(href, name, function() {
			log('deleted', tr);
			tr.remove();
			alert('Deleted ' + name);
		});
	});

	fileTable.on('click', '.btn-rename-file', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var target = $(this);
        var href = target.attr('href');
        promptRename(href, function(resp) {
            window.location.reload();
        });
    });

	fileTable.on('click', '.btn-history-file', function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    $('.btn-history-file').history({
        modal: $('#modal-history')
    });
}


function initAddPageModal() {
    log('initAddPageModal', $('.btn-add-page'));
    
    var modal = $('#modal-add-page');

	initFuseModal(modal, function () {
        modal.find('.modal-body').css('height', getStandardModalEditorHeight());
        initHtmlEditors(modal.find('.htmleditor'),  getStandardEditorHeight(), null, null, standardRemovePlugins + ',autogrow'); // disable autogrow
    });
    
	var form = modal.find('form');

    $('.btn-add-page').click(function(e) {
        e.preventDefault();
        log('initAddPageModal: click');

	    form.find('input[type=text], textarea,input[name=pageName]').val('');
	    form.unbind();
	    form.submit(function(e) {
            log('submit clicked', this);
            e.preventDefault();
            //createPage(modal.find('form'));
            doSavePage(form, null, false);
        });
        openFuseModal(modal);        
    });    
}

function showEditModal(name, pageArticle) {
    log('showEditModal', name, pageArticle);
	var modal = $('#modal-add-page');
	var form = modal.find('form');

	form.find('input[name=pageName]').val(name);
	form.find('input[type=text], textarea').val('');
	form.unbind();
	form.submit(function(e) {
        e.preventDefault();
        e.stopPropagation();
        log('edit submit click', this);
        doSavePage(form, pageArticle);
    });
    modal.find('.btn-history-page').unbind();
    modal.find('.btn-history-page').history({
        pageUrl: name,
        showPreview: false,
        afterRevertFn: function() {
            loadModalEditorContent(modal, name);
        },
        modal: $('#modal-history')
    });
    loadModalEditorContent(modal, name);
}

function doSavePage(form, pageArticle) {
	var modal = form.parents('.modal');
		log('doSavePage', form);

	resetValidation(form);
	if (!checkRequiredFields(form)) {
		return;
	}

	var title = form.find('input[name=title]');
	var data;
	log('check ck editors', CKEDITOR.instances);
	for (var key in CKEDITOR.instances) {
		var editor = CKEDITOR.instances[key];
		var content = editor.getData();
		log('got ck content', key, content, editor);
		var inp = $('textarea[name=' + key + ']', form);
		if (inp) {
			inp.html(content);
			log('updated', inp);
		}
	}
	data = form.serialize();

	var url = form.find('input[name=pageName]').val();
	if (url === null || url.length === 0) {
		url = 'autoname.new';
	}

	log('do ajax post', form.attr('action'), data);
	try {
		form.find('button[type=submit]').attr('disabled', 'true');
		log('set disabled', form.find('button[type=submit]'));
		form.add(modal).addClass('ajax-processing');
		$.ajax({
			type: 'POST',
			url: url,
			data: data,
			dataType: 'json',
			success: function(data) {
				log('set enabled', form.find('button[type=submit]'));
				form.add(modal).removeClass('ajax-processing');
				form.find('button[type=submit]').removeAttr('disabled');
				if (data.status) {
					var _title = title.val();
					if (pageArticle == null) { // indicated new page
						var pageName = getFileName(data.messages[0]);
						var href = data.nextHref;
						addPageToList(pageName, href, _title);
					} else {
						pageArticle.find('> span').text(_title);
					}
					closeFuseModal(modal);
				} else {
					alert('There was an error saving the page: ' + data.messages);
				}
			},
			error: function(resp) {
				form.add(modal).removeClass('ajax-processing');
				form.find('button[type=submit]').removeAttr('disabled');
				log('error', resp);
				alert('Sorry, an error occured saving your changes. If you have entered editor content that you dont want to lose, please switch the editor to source view, then copy the content. Then refresh the page and re-open the editor and paste the content back in.');
			}
		});
	} catch (e) {
		log('exception in createJob', e);
	}
	return false;
}

function loadModalEditorContent(modal, name) {        
    $.ajax({
        type: 'GET',
        url: name + '?type=json',
        dataType: 'json',
        success: function(resp) {
            var data = resp.data;
            log('resp', resp);
            var t = data.template;
            if (!t.endsWith('.html'))
                t += '.html';
            log('select template', t, modal.find('select option[value="' + t + '"]'));
            modal.find('select option').each(function(i, n) {
                var opt = $(n);
                //log('compare', opt.attr('value'),t );
                if( t.startsWith(opt.attr('value')) ) {
                    opt.attr('selected', 'true');
                }
            });
            modal.find('input[name=title]').val(data.title);
            modal.find('textarea').val(data.body); 
            openFuseModal(modal);
        },
        error: function(resp) {
            log('error', resp);
            alert('err: couldnt load page data');
        }
    });
}


function addPageToList(pageName, href, title) {
	var newFileName = getFileName(href);
    $('#page-list').append(
	    '<article class="page">' +
		    '<input type="hidden" value="" name="' + pageName + '" />' +
		    '<i class="fa clip-file-2"></i>' +
		    '<span class="article-name">' + title + '</span>' +
		    '<aside class="article-action">' +
			    '<a href="' + newFileName + '" class="btn btn-xs btn-success btn-edit-page" title="Edit page"><i class="fa fa-white fa-edit"></i></a> ' +
			    '<a href="?goto=' + newFileName + '" target="_blank" class="btn btn-xs btn-success" title="View page"><i class="fa fa-white clip-new-tab"></i></a> ' +
			    '<a href="' + href + '" class="btn btn-xs btn-danger btn-delete-page" title="Delete page"><i class="fa fa-white fa-times"></i></a>' +
		    '</aside>' +
	    '</article>'
    );
}


function showImportFromUrl() {
    var url = prompt('Please enter a url to import files from');
    if (url) {
        $.ajax({
            type: 'POST',
            url: window.location.pathname,
            dataType: 'json',
            data: {
                importFromUrl: url
            },
            success: function(data) {
                log('response', data);
                if (!data.status) {
                    alert('Failed to import');
                    return;
                } else {
                    alert('Importing has finished');
                    window.location.reload();
                }
            },
            error: function(resp) {
                log('error', resp);
                alert('err');
            }
        });
    }
}