function initManageGroup() {
	initCRUDGroup();
    addOrderGroup();
//    addOrderProgramList();
//    addOrderPermissionList();
    initGroupModal();
//    initPermissionCheckboxes();
//    initRegoMode();
	initCRUDRole();
    initCopyMembers();
//    initOptInGroups();
}

function initCRUDGroup() {
	var body = $(document.body);

	$('.btn-add-group').on('click', function (e) {
		e.preventDefault();
		log('addGroupButton: click');
		showGroupModal('Group', 'Add new group', 'Add');
	});

	// Bind event for Delete forum
	body.on('click', '.btn-delete-group', function(e) {
		e.preventDefault();

		var btn = $(this);
		var name = btn.closest('.btn-group').prev().text();
		var href = $.URLEncode(name);

		log('delete', href);
		confirmDelete(href, name, function() {
			log('remove ', this);

			btn.parents('div.group').remove();
		});
	});

	body.on('click', '.btn-rename-group', function(e) {
		e.preventDefault();

		var btn = $(this);
		var selectGroup = btn.parents('div.group');

		showGroupModal('Group', 'Rename group', 'Rename', {
			name: btn.closest('.btn-group').prev().text(),
			group: selectGroup.attr('data-group')
		});
	});
}

var currentGroupDiv;

function initCRUDRole() {
	var body = $(document.body);
	var modal = $('#modal-edit-roles');

	body.on('click', '.btn-add-role-group', function (e) {
		e.preventDefault();

		currentGroupDiv = $(this).parents('.group');
	});

	body.on('click', '.btn-remove-role', function(e) {
		log('click', this);
		e.preventDefault();

		if (confirm('Are you sure you want to remove this role?')) {
			var btn = $(this);
			log('do it', btn);
			var href = btn.attr('href');
			deleteFile(href, function() {
				btn.closest('span.role').remove();
			});
		}
	});

	modal.on('click', 'input:radio', function(e) {
		var input = $(this);
		var appliesTo = input.closest('.applies-to');
		appliesTo.find('select').addClass('hide');
		appliesTo.find('input[type=radio]:checked').next().next().removeClass('hide');
	});

	modal.on('click', '.btn-add-role', function(e) {
		e.preventDefault();

		var btn = $(this);
		var article = btn.closest('article');
		var appliesTo = $('div.applies-to');
		var appliesToType = appliesTo.find('input:checked');

		if (!appliesToType[0]) {
			alert('Please select what the role applies to');
			return;
		}

		var appliesToTypeVal = appliesToType.val();
		var select = appliesToType.next().next();
		var appliesToVal = ''; // if need to select a target then this has its value
		if (select[0]) {
			appliesToVal = select.val();
			if (appliesToVal.length == 0) {
				alert('Please select a target for the role');
				return;
			}
			appliesToText = select.find('option:checked').text();
		} else {
			appliesToText = 'their own organisation';
		}

		log('add role', appliesToTypeVal, appliesToVal);
		log('currentGroupDiv', currentGroupDiv);

		var groupHref = currentGroupDiv.find('span.group-name').text();
		var roleName = btn.closest('.article-action').prev().text();

		addRoleToGroup(groupHref, roleName, appliesToTypeVal, appliesToVal, function(resp) {
			if (appliesToVal.length == 0) {
				appliesToVal = 'their own organisation';
			}

			currentGroupDiv.find('.roles-wrapper').append(
				'<span class="role">' +
					'<span>' + roleName + ', on ' + appliesToText + '</span> ' +
					'<a class="btn btn-xs btn-danger btn-remove-role" href="' + resp.nextHref + '" title="Remove this role"><i class="clip-minus-circle "></i></a>' +
				'</span>'
			);
		});
	});
}


function addRoleToGroup(groupHref, roleName, appliesToType, appliesTo, callback) {
    log('addRoleToGroup', groupHref, roleName, appliesToType, appliesTo);

    try {
        $.ajax({
            type: "POST",
            url: groupHref,
            dataType: 'json',
            data: {
                appliesToType: appliesToType,
                role: roleName,
                appliesTo: appliesTo
            },
            success: function(data) {
                log('success', data);
                if (data.status) {
                    log('saved ok', data);
                    callback(data);
                    alert('Added role');
                } else {
                    var msg = data.messages + '\n';
                    if (data.fieldMessages) {
                        $.each(data.fieldMessages, function(i, n) {
                            msg += '\n' + n.message;
                        });
                    }
                    log('error msg', msg);
                    alert('Couldnt save the new role: ' + msg);
                }
            },
            error: function(resp) {
                log('error', resp);
                alert('Error, couldnt add role');
            }
        });
    } catch (e) {
        log('exception in createJob', e);
    }
}

function initPermissionCheckboxes() {
    $('body').on('click', '.roles input[type=checkbox]', function(e) {
        var $chk = $(this);
        log('checkbox click', $chk, $chk.is(':checked'));
        var isRecip = $chk.is(':checked');
        var groupName = $chk.closest('aside').attr('rel');
        var permissionList = $chk.closest('.ContentGroup').find('.PermissionList');
        setGroupRole(groupName, $chk.attr('name'), isRecip, permissionList);
    });
}

function setGroupRole(groupName, roleName, isRecip, permissionList) {
    log('setGroupRole', groupName, roleName, isRecip);
    try {
        $.ajax({
            type: "POST",
            url: window.location.href,
            data: {
                group: groupName,
                role: roleName,
                isRecip: isRecip
            },
            success: function(data) {
                log('saved ok', data);
                if (isRecip) {
                    permissionList.append('<li>' + roleName + '</li>');
                } else {
                    log('remove', permissionList.find('li:contains("' + roleName + '")'));
                    permissionList.find('li:contains("' + roleName + '")').remove();
                }
            },
            error: function(resp) {
                log('error', resp);
                alert('err');
            }
        });
    } catch (e) {
        log('exception in createJob', e);
    }
}



function addOrderGroup() {
    $('div.group').each(function(i) {
        $(this).attr('data-group', i);
    });
}

function addOrderProgramList() {
    var tempControl = $('#modalListController').html();
    $('#modalGroup tr[rel=Program] ul.ListItem li').each(function(i) {
        $(this)
                .attr('data-program', i)
                .append(tempControl)
                .find('label', 'input')
                .each(function() {
            var _this = $(this);
            var _randomId = Math.round(Math.random() * 100000);
            var _for = _this.attr('for') || null;
            var _name = _this.attr('name') || null;
            var _id = _this.attr('id') || null;

            if (_for) {
                _this.attr('for', _for + _randomId);
            }

            if (_name) {
                _this.attr('name', _name + _randomId);
            }

            if (_id) {
                _this.attr('id', _id + _randomId);
            }
        });
    });
}

function addOrderPermissionList() {
    var tempControl = $('#modalListController').html();
    $('#modalGroup tr[rel=Permission] ul.ListItem li').each(function(i) {
        $(this).attr('data-permission', i).append(tempControl);
    });
}

function resetModalControl() {
    var modal = $('#modal-group');

	modal.find('input[type=text]').val('');
	modal.attr('data-group', '');
}

function showGroupModal(name, title, type, data) {
    resetModalControl();

	var modal = $('#modal-group');
    log('showGroupModal', modal);

    modal.find('.modal-title').html(title);
	modal.find('.btn-save-group').text(type);

    if (data) {
        if (data.name) {
            modal.find('input[name=name]').val(data.name);
        }

        if (data.group) {
            modal.attr('data-group', data.group);
        }

//        if (data.program) {
//            var _programList = modal.find('tr[rel=Program] ul.ListItem li');
//            var _programs = data.program;
//
//            for (var i = 0; i < _programs.length; i++) {
//                _programList
//                        .filter('[data-program=' + _programs[i] + ']')
//                        .find('input[type=checkbox]')
//                        .check(true);
//            }
//        }
//
//        if (data.permission) {
//            var _permissionList = modal.find('tr[rel=Permission] ul.ListItem li');
//            var _permission = data.permission;
//
//            for (var i = 0; i < _permission.length; i++) {
//                _permissionList
//                        .filter('[data-permission=' + _permission[i] + ']')
//                        .find('input[type=checkbox]')
//                        .check(true);
//            }
//        }
    }

	modal.modal('show');
}

function maxOrderGroup() {
    var _order = [];
    $('div.Group').each(function() {
        _order.push($(this).attr('data-group'));
    });

    _order.sort().reverse();

    return (parseInt(_order[0]) + 1);
}

function initGroupModal() {
	var modal = $('#modal-group');

    // Event for Add/Edit button
    modal.find('.btn-save-group').click(function(e) {
	    e.preventDefault();

        log('Click add/edit group');
        var btn = $(this);
        var type = btn.html();

	    var name = modal.find('input[name=name]').val();

	    if (name.trim() !== '') {
		    if (type === 'Add') {
			    createFolder(name, null, function(name, resp) {
				    window.location.reload();
			    });

		    } else { // If is editing Group
			    var groupDiv = $('div.group').filter('[data-group=' + modal.attr('data-group') + ']');
			    var groupNameSpan = groupDiv.find('span.group-name');
			    var src = groupNameSpan.text();
			    src = $.URLEncode(src);
			    var dest = name;
			    dest = window.location.pathname + dest;
			    move(src, dest, function() {
				    groupNameSpan.text(name);
			    });
		    }

		    resetModalControl();
		    modal.modal('show');
	    } else {
		    alert('Please enter group name!');
	    }
    });
}

function initRegoMode() {
    $('body').on('click', 'a.regoMode', function(e) {
        log('click', e.target);
        e.preventDefault();
        e.stopPropagation();
        var target = $(e.target);
        var href = target.closest('div.Group').find('header div > span').text();
        href = $.URLEncode(href) + '/';
        var modal = $('#modalRegoMode');
        modal.load(href + ' #modalRegoCont', function() {
            initOptInGroups();
            $('#modalRegoMode form.general').forms({
                callback: function(resp) {
                    log('done', resp);
                    $.tinybox.close();
                    //window.location.reload();
                    $('div.content').load(window.location.pathname + ' div.content > *', function() {

                    });
                }
            });

            $('#modalRegoMode form.fields').forms({
                confirmMessage: null,
                callback: function(resp, form) {
                    if (resp.status) {
                        var key = form.find('input[name=addFieldName]').val();
                        var val = form.find('input[name=addFieldValue]').val();
                        newLi = $('<li><h4>' + key + '</h4>' + val + '<a href="' + key + '" class="removeField">Delete</a></li>');
                        $('ul.fields').append(newLi);
                        $(".addField").toggle();
                        form.find('input').val('');
                    } else {
                        alert('Couldnt add the field. Please check your input and try again');
                    }
                }
            });

            modal.on('click','a.removeField', function(e) {
                log('click removeField');
                e.preventDefault();
                var target = $(e.target);
                var li = target.closest('li');
                var fieldName = target.attr('href');
                var groupHref = li.closest('form').attr('action');
                removeField(groupHref, fieldName, li);
            });

            log('done forms', modal);

            $.tinybox.show(modal, {
                overlayClose: false,
                opacity: 0
            });
            log('showed modal');
        });

    });
}

function removeField(groupHref, fieldName, li) {
    try {
        $.ajax({
            type: "POST",
            url: groupHref,
            data: {
                removeFieldName: fieldName
            },
            success: function(data) {
                log('saved ok', data);
                li.remove();
            },
            error: function(resp) {
                log('error', resp);
                alert('There was an error removing the field. Please check your internet connection');
            }
        });
    } catch (e) {
        log('exception in createJob', e);
    }
}

function setRegoMode(currentRegoModeLink, selectedRegoModeLink) {
    var val = selectedRegoModeLink.attr('rel');
    var text = selectedRegoModeLink.text();
    var data = 'milton:regoMode=' + val;
    var href = currentRegoModeLink.closest('div.Group').find('header div > span').text();
    href = $.URLEncode(href) + '/';
    log('setRegoMode: val=', val, 'text=', text, 'data=', data, 'href=', href);
    proppatch(href, data, function() {
        currentRegoModeLink.text(text);
    });
}

function initCopyMembers() {
	var body = $(document.body);
	var modal = $('#modal-copy-members');

	body.on('click', '.btn-copy-member', function(e) {
        log('click', this);
        e.preventDefault();

        var btn = $(this);
        var href = btn.closest('div.group').find('span.group-name').text();
        modal.find('span.group-name').text(href);
        href = $.URLEncode(href) + '/';
        modal.find('form').attr('action', href);
		modal.modal('show');
    });

	modal.find('form').forms({
        callback: function(resp) {
            log('done', resp);
            $.tinybox.close();
            alert('Copied members');
            window.location.reload();
        }
    });
}

function initOptInGroups() {
    $('.optins input[type=checkbox]').click(function(e) {
        updateOptIn($(e.target));
    }).each(function(i, n) {
        updateOptIn($(n));
    });
}

function updateOptIn(chk) {
    if (chk.is(':checked')) {
        chk.closest('li').addClass('checked');
    } else {
        chk.closest('li').removeClass('checked');
    }

}