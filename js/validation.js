var bValidUser = false;


function ValidateRegisterForm()
{
	var b1 = passValidate();
	var b2 = passConfirmValidate();
	
	if(bValidUser && b1 && b2)
	{
		return true;
	}
	return false;
}

$(document).ready(function(e) {
    $("#username").blur(function() {
		userValidate();
	});
	$("#username").focus(function() {
		bValidUser = false;
		$("#username").removeClass("has_error");
	});
	
	$("#password").blur(function() {
		passValidate();
		passConfirmValidate();
	});
	$("#password").focus(function() {
		$("#password").removeClass("has_error");
	});
	
	$("#passwordConfirm").blur(function() {
		passConfirmValidate();
	});
	$("#passwordConfirm").focus(function() {
		$("#passwordConfirm").removeClass("has_error");
	});
});

function userValidate()
{
	$("#username").val = $("#username").val().trim();

	if($("#username").val() != "")
	{
		checkUnusedUser($("#username").val());
	}
}

function checkUnusedUser(user) {
	$.post("../inc/userCheck.php", {user: user}, function(result) {
		console.log(result);
		if(result == "0") {
			$("#username").removeClass("has_error");
			bValidUser = true;
		} else {
			$("#username").addClass("has_error");
			bValidUser = false;
		}
	});
}

function passValidate()
{	
	if($("#password").val().trim().length >= 8)
	{
		$("#password").removeClass("has_error");
		return true;
	} else {
		$("#password").addClass("has_error");
		return false;
	}
}

function passConfirmValidate()
{
	if($("#passwordConfirm").val() == $("#password").val())
	{
		$("#passwordConfirm").removeClass("has_error");
		return true;
	} else {
		$("#passwordConfirm").addClass("has_error");
		return false;
	}
}