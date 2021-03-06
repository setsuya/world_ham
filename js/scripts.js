$(document).ready(function(){
	loadSkills();
	loadPieces();
	savedSets();

	if(location.search){
		parseSet((location.search).substr(1));
	}else{
		newSet();
		buildSet();
	}

	if(!(localStorage.getItem("color_mode") === null)){
		color = localStorage.getItem("color_mode");
		toggleColor($("#" + color));
	}else{
		toggleColor($("#dark_mode"));
	}
	
	$("#menu_button").css("height", $("#title_bar").outerHeight());
	$("#menu_button > input").css("top", ($("#title_bar").outerHeight() - $("#menu_button > input").outerHeight()) / 2);

	$("#overlay").fadeOut("slow");
});

deco_pieces = {};
deco_pieces[1] = "";
deco_pieces[2] = "";
deco_pieces[3] = "";
armor_list = [];
backup_id = "";
promises = [];

function handleClientLoad(){
	gapi.load("client:auth2", initClient);
}

function initClient(){
	gapi.client.init({
		apiKey: "AIzaSyBMocTTVj1H-5eSzgNhgGqjZtpmKYAcvJY", 
		clientId: "679422822157-1783k4d9t57dlq846caln9771hfgq2fc.apps.googleusercontent.com", 
		scope: "https://www.googleapis.com/auth/drive.appdata"
	}).then(function(){
		gapi.client.load("drive", "v3").then(function(){searchBackup();});
		gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
	});
}

function updateSigninStatus(isSignedIn) {
	if(isSignedIn){
		$("#drive_options").html("<div class=\"btn-group btn-block\"><input type=\"button\" id=\"drive_backup\" class=\"btn btn-warning btn-sm w-50\" value=\"Backup\" onclick=\"uploadSets()\" style=\"border-right: 1px solid #935e00;\" /><input type=\"button\" id=\"drive_restore\" class=\"btn btn-warning btn-sm w-50\" value=\"Restore\" onclick=\"downloadSets()\" style=\"border-left: 1px solid #b37e00;\" /></div><input type=\"button\" id=\"drive_login\" class=\"btn btn-info btn-sm btn-block\" value=\"Google Drive Logout\" onclick=\"driveSignOut()\" />");

		if(backup_id == ""){
			$("#drive_restore").prop("disabled", true);
		}
	}else{
		$("#drive_options").html("<input type=\"button\" id=\"drive_login\" class=\"btn btn-info btn-sm btn-block\" value=\"Google Drive Login\" onclick=\"driveSignIn()\" />");
	}
}

function driveSignIn(){
	gapi.auth2.getAuthInstance().signIn();
}

function driveSignOut(){
	gapi.auth2.getAuthInstance().signOut().then(function(){
		gapi.auth2.getAuthInstance().disconnect();
		gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse();
	});
}

function searchBackup(){
	if(gapi.auth2.getAuthInstance().isSignedIn.get()){
		request = gapi.client.drive.files.list({
			"q": "name='armor_sets.json'", 
			"spaces": "appDataFolder"
		});

		request.execute(function(data){
			if(data.files.length > 0){
				backup_id = data.files[0].id;
			}

			updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		});
	}else{
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
	}
}

function uploadSets(){
	if(backup_id != ""){
		upload_type = "PATCH";
		upload_uri = "/" + backup_id;

		fileMetadata = {
			"name": "armor_sets.json", 
			"mimeType": "application/json"
		};
	}else{
		upload_type = "POST";
		upload_uri = "";

		fileMetadata = {
			"name": "armor_sets.json", 
			"parents": ["appDataFolder"], 
			"mimeType": "application/json"
		};
	}

	data = new FormData();
	data.append("metadata", new Blob([JSON.stringify(fileMetadata)], {type: "application/json" }));
	data.append("file", new Blob([JSON.stringify(localStorage.getItem("armor_sets"))], {type: "application/json"}));

	token = gapi.auth.getToken();

	$.ajax("https://www.googleapis.com/upload/drive/v3/files" + upload_uri + "?uploadType=multipart", {
		"data": data,
		"headers": {Authorization: "Bearer " + token.access_token},
		"contentType": false,
		"processData": false,
		"type": upload_type,
		"success": function(data) {
			backup_id = data.id;
			$("#drive_restore").prop("disabled", false);
			showToast("Backup successful.");
		}, 
		"error": function(data){
			console.log(data);
		}
	});
}

function downloadSets(){
	if(backup_id != ""){
		gapi.client.drive.files.get({
			"fileId": backup_id, 
			"alt": "media"
		}).then(function(data){
			localStorage.armor_sets = data.result;
			savedSets();
			showToast("Backup restored.");
		});
	}
}

function showToast(msg){
	$("#toast_msg").text(msg);
	$("#toast").fadeIn().delay(2000).fadeOut("slow");
}

function toggleMenu(){
	if(!$("#menu").hasClass("menu_show")){
		$("#menu").animate({"right": "-=" + $("#menu").outerWidth()});
		$("#title_bar").animate({"width": "-=" + $("#menu").outerWidth()});
		$("#menu").toggleClass("menu_show");
	}else{
		$("#title_bar").animate({"width": "100%"});
		$("#menu").animate({"right": "100%"});
		$("#menu").toggleClass("menu_show");
	}
}

function toggleColor(mode){
	$(mode).addClass("btn-warning").removeClass("btn-dark");
	$(mode).siblings(".btn").addClass("btn-dark").removeClass("btn-warning");

	if($(mode).attr("id") == "light_mode"){
		$("body").removeClass("dark_body");
		$("#armor_items .text-light").removeClass("text-light");
	}else{
		$("body").addClass("dark_body");
		$("#armor_items .text-right").addClass("text-light");
	}

	localStorage.color_mode = $(mode).attr("id");
}

function savedSets(){
	if(!(localStorage.getItem("armor_sets") === null)){
		saved_sets = JSON.parse(localStorage.getItem("armor_sets"));
		list_items = "";

		for(set in saved_sets){
			list_items += "<div class=\"saved_set row py-1 px-2 align-items-center\"><div class=\"input-group\"><input type=\"text\" class=\"saved_item form-control form-control-sm\" data-id=\"" + set + "\" value=\"" + saved_sets[set].name + "\" onclick=\"parseSet('" + saved_sets[set].set + "')\" readonly /><div class=\"input-group-append\"><input type=\"button\" class=\"btn btn-sm btn-info\" value=\"&#9998;\" onclick=\"parseSet('" + saved_sets[set].set + "', '" + set + "')\" /><input type=\"button\" class=\"btn btn-sm btn-danger\" value=\"&times;\" onclick=\"deleteSet('" + set + "')\" /></div></div></div>";
		}

		if(list_items != ""){
			$("#sets_list").html(list_items);
		}else{
			$("#sets_list").html("<div class=\"row py-1 px-2 text-center h-100 align-items-center text-secondary\"><div class=\"col font-italic\" style=\"text-shadow: 1px 1px 0 #111;\">No saved sets.</div></div>");
		}
	}else{
		$("#sets_list").html("<div class=\"row py-1 px-2 text-center h-100 align-items-center text-secondary\"><div class=\"col font-italic\" style=\"text-shadow: 1px 1px 0 #111;\">No saved sets.</div></div>");
	}
}

function parseSet(custom_set_string, set_id){
	custom_set_string = atob(custom_set_string);
	custom_set = custom_set_string.split(",");

	if(set_id){
		$("#save_id").val(set_id);
		
		save_obj = JSON.parse(localStorage.getItem("armor_sets"));
		$("#set_name").val(save_obj[set_id].name);
	}else{
		$("#set_name").val("");
		$("#save_id").val("");
	}

	$("#weapon_list > select:eq(0) option[data-id='" + custom_set[0] + "']")[0].selected = true;
	$("#weapon_list > select:eq(0) option[data-id='" + custom_set[0] + "']").trigger("change");

	$("#weapon_list > select:eq(1) option[data-id='" + custom_set[1] + "']")[0].selected = true;
	$("#weapon_list > select:eq(1) option[data-id='" + custom_set[1] + "']").trigger("change");

	$("#weapon_list > select:eq(2) option[data-id='" + custom_set[2] + "']")[0].selected = true;
	$("#weapon_list > select:eq(2) option[data-id='" + custom_set[2] + "']").trigger("change");

	$("#head_list option[data-id='" + custom_set[3] + "']")[0].selected = true;
	$("#head_list option[data-id='" + custom_set[3] + "']").trigger("change");

	$("#chest_list option[data-id='" + custom_set[4] + "']")[0].selected = true;
	$("#chest_list option[data-id='" + custom_set[4] + "']").trigger("change");

	$("#arms_list option[data-id='" + custom_set[5] + "']")[0].selected = true;
	$("#arms_list option[data-id='" + custom_set[5] + "']").trigger("change");

	$("#waist_list option[data-id='" + custom_set[6] + "']")[0].selected = true;
	$("#waist_list option[data-id='" + custom_set[6] + "']").trigger("change");

	$("#legs_list option[data-id='" + custom_set[7] + "']")[0].selected = true;
	$("#legs_list option[data-id='" + custom_set[7] + "']").trigger("change");

	$("#charm_list option[data-id='" + custom_set[8] + "']")[0].selected = true;
	$("#charm_list option[data-id='" + custom_set[8] + "']").trigger("change");

	for(i = 9; i < custom_set.length; i++){
		cont = i - 9;
		$(".armor_slot:eq(" + cont + ") option[data-id='" + custom_set[i] + "']")[0].selected = true;
	}

	if($("#menu").hasClass("menu_show")){
		$("#title_bar").css({"width": ($(window).width() - $("#menu").outerWidth())});
		$("#menu").css({"right": ($(window).width() - $("#menu").outerWidth())});
	}

	buildSet();
}

function loadSkills(){
	all_skills = "<option>--- Search skills ---</option>";

	for(item in skills){
		if(skills[item].name != "DUMMY"){
			all_skills += "<option data-id=\"" + item + "\">" + skills[item].name + "</option>";
		}
	}

	$("#armor_search > select").html(all_skills);
	tinysort($("#armor_search > select option"));
	$("#armor_search option:eq(0)")[0].selected = true;
	$("#armor_search option:eq(0)").trigger("change");
}

function loadPieces(){
	low_rank_head = "";
	high_rank_head = "";
	head_pieces = "";

	low_rank_chest = "";
	high_rank_chest = "";
	chest_pieces = "";

	low_rank_arms = "";
	high_rank_arms = "";
	arms_pieces = "";

	low_rank_waist = "";
	high_rank_waist = "";
	waist_pieces = "";

	low_rank_legs = "";
	high_rank_legs = "";
	legs_pieces = "";

	charm_pieces = "<option data-id=\"ff\">-----</option>";

	for(piece in armor){
		part = armor[piece].part;

		switch(part){
			case("head"):
				piece_skills = armor[piece].skills;
				piece_slots = armor[piece].slots;

				piece_skills_list = "";
				piece_slots_list = "";
				piece_set_skills_list = "";

				if(armor[piece].set_bonus_id){
					piece_set_skills_list = " data-set-skills=\"" + armor[piece].set_bonus_id + "\"";
				}

				for(skill in piece_skills){
					piece_skills_list += "[" + piece_skills[skill].id + "," + piece_skills[skill].level + "],";
				}

				for(slot in piece_slots){
					if(piece_slots[slot] != 0){
						piece_slots_list += piece_slots[slot] + ",";
					}
				}

				piece_skills_list = piece_skills_list.substr(0, piece_skills_list.length - 1);
				if(piece_slots_list != ""){
					piece_slots_list = piece_slots_list.substr(0, piece_slots_list.length - 1);
					piece_slots_list = "[" + piece_slots_list + "]";
				}

				if(armor[piece].rank == "low"){
					low_rank_head += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\"" + piece_set_skills_list + ">" + armor[piece].name + "</option>";
				}else{
					high_rank_head += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\"" + piece_set_skills_list + ">" + armor[piece].name + "</option>";
				}

				break;
			case("chest"):
				piece_skills = armor[piece].skills;
				piece_slots = armor[piece].slots;

				piece_skills_list = "";
				piece_slots_list = "";
				piece_set_skills_list = "";

				if(armor[piece].set_bonus_id){
					piece_set_skills_list = " data-set-skills=\"" + armor[piece].set_bonus_id + "\"";
				}

				for(skill in piece_skills){
					piece_skills_list += "[" + piece_skills[skill].id + "," + piece_skills[skill].level + "],";
				}

				for(slot in piece_slots){
					if(piece_slots[slot] != 0){
						piece_slots_list += piece_slots[slot] + ",";
					}
				}

				piece_skills_list = piece_skills_list.substr(0, piece_skills_list.length - 1);
				if(piece_slots_list != ""){
					piece_slots_list = piece_slots_list.substr(0, piece_slots_list.length - 1);
					piece_slots_list = "[" + piece_slots_list + "]";
				}

				if(armor[piece].rank == "low"){
					low_rank_chest += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\"" + piece_set_skills_list + ">" + armor[piece].name + "</option>";
				}else{
					high_rank_chest += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\"" + piece_set_skills_list + ">" + armor[piece].name + "</option>";
				}

				break;
			case("arms"):
				piece_skills = armor[piece].skills;
				piece_slots = armor[piece].slots;

				piece_skills_list = "";
				piece_slots_list = "";
				piece_set_skills_list = "";

				if(armor[piece].set_bonus_id){
					piece_set_skills_list = " data-set-skills=\"" + armor[piece].set_bonus_id + "\"";
				}

				for(skill in piece_skills){
					piece_skills_list += "[" + piece_skills[skill].id + "," + piece_skills[skill].level + "],";
				}

				for(slot in piece_slots){
					if(piece_slots[slot] != 0){
						piece_slots_list += piece_slots[slot] + ",";
					}
				}

				piece_skills_list = piece_skills_list.substr(0, piece_skills_list.length - 1);
				if(piece_slots_list != ""){
					piece_slots_list = piece_slots_list.substr(0, piece_slots_list.length - 1);
					piece_slots_list = "[" + piece_slots_list + "]";
				}

				if(armor[piece].rank == "low"){
					low_rank_arms += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\"" + piece_set_skills_list + ">" + armor[piece].name + "</option>";
				}else{
					high_rank_arms += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\"" + piece_set_skills_list + ">" + armor[piece].name + "</option>";
				}

				break;
			case("waist"):
				piece_skills = armor[piece].skills;
				piece_slots = armor[piece].slots;

				piece_skills_list = "";
				piece_slots_list = "";
				piece_set_skills_list = "";

				if(armor[piece].set_bonus_id){
					piece_set_skills_list = " data-set-skills=\"" + armor[piece].set_bonus_id + "\"";
				}

				for(skill in piece_skills){
					piece_skills_list += "[" + piece_skills[skill].id + "," + piece_skills[skill].level + "],";
				}

				for(slot in piece_slots){
					if(piece_slots[slot] != 0){
						piece_slots_list += piece_slots[slot] + ",";
					}
				}

				piece_skills_list = piece_skills_list.substr(0, piece_skills_list.length - 1);
				if(piece_slots_list != ""){
					piece_slots_list = piece_slots_list.substr(0, piece_slots_list.length - 1);
					piece_slots_list = "[" + piece_slots_list + "]";
				}

				if(armor[piece].rank == "low"){
					low_rank_waist += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\"" + piece_set_skills_list + ">" + armor[piece].name + "</option>";
				}else{
					high_rank_waist += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\"" + piece_set_skills_list + ">" + armor[piece].name + "</option>";
				}

				break;
			case("legs"):
				piece_skills = armor[piece].skills;
				piece_slots = armor[piece].slots;

				piece_skills_list = "";
				piece_slots_list = "";
				piece_set_skills_list = "";

				if(armor[piece].set_bonus_id){
					piece_set_skills_list = " data-set-skills=\"" + armor[piece].set_bonus_id + "\"";
				}

				for(skill in piece_skills){
					piece_skills_list += "[" + piece_skills[skill].id + "," + piece_skills[skill].level + "],";
				}

				for(slot in piece_slots){
					if(piece_slots[slot] != 0){
						piece_slots_list += piece_slots[slot] + ",";
					}
				}

				piece_skills_list = piece_skills_list.substr(0, piece_skills_list.length - 1);
				if(piece_slots_list != ""){
					piece_slots_list = piece_slots_list.substr(0, piece_slots_list.length - 1);
					piece_slots_list = "[" + piece_slots_list + "]";
				}

				if(armor[piece].rank == "low"){
					low_rank_legs += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\"" + piece_set_skills_list + ">" + armor[piece].name + "</option>";
				}else{
					high_rank_legs += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\"" + piece_set_skills_list + ">" + armor[piece].name + "</option>";
				}

				break;
		}
	}

	for(piece in charms){
		piece_skills = charms[piece].skills;

		piece_skills_list = "";

		for(skill in piece_skills){
			piece_skills_list += "[" + piece_skills[skill].id + "," + piece_skills[skill].level + "],";
		}

		piece_skills_list = piece_skills_list.substr(0, piece_skills_list.length - 1);

		charm_pieces += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\">" + charms[piece].name + "</option>";
	}

	for(piece in decorations){
		deco_item = decorations[piece];

		if(deco_item.name != "DUMMY"){
			deco_pieces[deco_item.level] = deco_pieces[deco_item.level] + "<option data-id=\"" + deco_item.skills[0].id + "\" data-skills=\"[" + deco_item.skills[0].id + "," + deco_item.skills[0].level + "]\">" + decorations[piece].name + " (" + skills[deco_item.skills[0].id].name + ")</option>";
		}
	}

	deco_pieces[1] = "<optgroup label=\"Level 1\">" + deco_pieces[1] + "</optgroup>";
	deco_pieces[2] = "<optgroup label=\"Level 2\">" + deco_pieces[2] + "</optgroup>";
	deco_pieces[3] = "<optgroup label=\"Level 3\">" + deco_pieces[3] + "</optgroup>";

	head_pieces = "<optgroup label=\"Low Rank\">" + low_rank_head + "</optgroup><optgroup label=\"High Rank\">" + high_rank_head + "</optgroup>";
	chest_pieces = "<optgroup label=\"Low Rank\">" + low_rank_chest + "</optgroup><optgroup label=\"High Rank\">" + high_rank_chest + "</optgroup>";
	arms_pieces = "<optgroup label=\"Low Rank\">" + low_rank_arms + "</optgroup><optgroup label=\"High Rank\">" + high_rank_arms + "</optgroup>";
	waist_pieces = "<optgroup label=\"Low Rank\">" + low_rank_waist + "</optgroup><optgroup label=\"High Rank\">" + high_rank_waist + "</optgroup>";
	legs_pieces = "<optgroup label=\"Low Rank\">" + low_rank_legs + "</optgroup><optgroup label=\"High Rank\">" + high_rank_legs + "</optgroup>";

	$("#head_list").html(head_pieces);
	tinysort($("#head_list optgroup:eq(0) option"));
	tinysort($("#head_list optgroup:eq(1) option"));

	$("#chest_list").html(chest_pieces);
	tinysort($("#chest_list optgroup:eq(0) option"));
	tinysort($("#chest_list optgroup:eq(1) option"));

	$("#arms_list").html(arms_pieces);
	tinysort($("#arms_list optgroup:eq(0) option"));
	tinysort($("#arms_list optgroup:eq(1) option"));

	$("#waist_list").html(waist_pieces);
	tinysort($("#waist_list optgroup:eq(0) option"));
	tinysort($("#waist_list optgroup:eq(1) option"));

	$("#legs_list").html(legs_pieces);
	tinysort($("#legs_list optgroup:eq(0) option"));
	tinysort($("#legs_list optgroup:eq(1) option"));

	$("#charm_list").html(charm_pieces);
	tinysort($("#charm_list option"));
}

function checkSlots(armor_piece){
	piece_slots = $(armor_piece).find("option:selected").attr("data-slots");

	if(piece_slots != ""){
		piece_slots = JSON.parse(piece_slots);
		piece_slots_content = "";

		for(slot in piece_slots){
			piece_slots_content += "<div class=\"row align-items-center\"><div class=\"col-1 pr-0 text-right text-light\">" + piece_slots[slot] + ":</div><div class=\"col-11\"><select class=\"armor_slot form-control form-control-sm\" onchange=\"buildSet()\"><option data-id=\"ff\">-----</option>";

			for(i = 1; i <= piece_slots[slot]; i++){
				piece_slots_content += deco_pieces[i];
			}

			piece_slots_content += "</select></div></div>";
		}

		if($(armor_piece).attr("data-wpn-slot")){
			$(armor_piece).parent().next(".slot_list").find("#wpn_slot_" + $(armor_piece).attr("data-wpn-slot")).html(piece_slots_content);
		}else{
			$(armor_piece).parent().next(".slot_list").html(piece_slots_content);
		}

	}else{
		if($(armor_piece).attr("data-wpn-slot")){
			$(armor_piece).parent().next(".slot_list").find("#wpn_slot_" + $(armor_piece).attr("data-wpn-slot")).html("");
		}else{
			$(armor_piece).parent().next(".slot_list").html("");
		}
	}

	$(".armor_slot optgroup").each(function(){
		tinysort($(this).find("option"));
	});

	buildSet();
}

function searchArmor(){
	if($("#armor_search > select option:selected").attr("data-id")){
		search_id = $("#armor_search > select option:selected").attr("data-id");
		search_pieces = [];
		search_points = [];
		pieces_result = {"head": "", "chest": "", "arms": "", "waist": "", "legs": ""};
		search_result = "";

		for(item in armor){
			for(skill in armor[item].skills){
				if(armor[item].skills[skill].id == search_id){
					search_pieces.push(item);
					search_points.push(armor[item].skills[skill].level);
					break;
				}
			}
		}

		for(item in search_pieces){
			pieces_result[armor[search_pieces[item]].part] = pieces_result[armor[search_pieces[item]].part] + "<option data-id=\"" + search_pieces[item] + "\">" + armor[search_pieces[item]].name + " (" + search_points[item] + "pt.)</option>";
		}

		for(part in pieces_result){
			if(pieces_result[part] == ""){
				pieces_result[part] = "<option>--- No results. ---</option>";
			}
		}

		search_result = "<optgroup label=\"Head Armor\">" + pieces_result.head + "</optgroup><optgroup label=\"Chest Armor\">" + pieces_result.chest + "</optgroup><optgroup label=\"Arms Armor\">" + pieces_result.arms + "</optgroup><optgroup label=\"Waist Armor\">" + pieces_result.waist + "</optgroup><optgroup label=\"Legs Armor\">" + pieces_result.legs + "</optgroup>";

		if(search_result != ""){
			search_result = "<select class=\"form-control form-control-sm col-10\"><option>--- " + search_pieces.length + " results found. ---</option>" + search_result + "</select><div class=\"input-group-append col-2 p-0\"><div class=\"btn btn-info btn-sm btn-block px-3\" role=\"button\" onclick=\"addFromSearch()\"><div>&plus;</div></div></div>";
			$("#search_results").html(search_result).addClass("pt-2");

			tinysort($("#search_results optgroup:eq(0) option"));
			tinysort($("#search_results optgroup:eq(1) option"));
			tinysort($("#search_results optgroup:eq(2) option"));
			tinysort($("#search_results optgroup:eq(3) option"));
			tinysort($("#search_results optgroup:eq(4) option"));
			$("#search_results option")[0].selected = true;
			$("#search_results option").trigger("change");
		}else{
			search_result = "<select class=\"form-control form-control-sm col-10\"><option>--- No results found. ---</option></select><div class=\"input-group-append col-2 p-0\"><div class=\"btn btn-info btn-sm btn-block disabled px-3\" role=\"button\"><div>&plus;</div></div></div>";
			$("#search_results").html(search_result).addClass("pt-2");
		}
	}
}

function addFromSearch(){
	if($("#search_results > select option:selected").attr("data-id")){
		add_piece_id = $("#search_results > select option:selected").attr("data-id");
		add_piece = armor[add_piece_id];

		$("#" + add_piece.part + "_list option[data-id='" + add_piece_id + "']")[0].selected = true;
		$("#" + add_piece.part + "_list option[data-id='" + add_piece_id + "']").trigger("change");
	}
}

function buildSet(){
	set_skills = [];
	final_skills = {};
	final_bonus_skills = {};
	armor_list = [];

	armor_list.push($("#weapon_list > select:eq(0) > option:selected").attr("data-id"));
	armor_list.push($("#weapon_list > select:eq(1) > option:selected").attr("data-id"));
	armor_list.push($("#weapon_list > select:eq(2) > option:selected").attr("data-id"));
	armor_list.push($("#head_list option:selected").attr("data-id"));
	armor_list.push($("#chest_list option:selected").attr("data-id"));
	armor_list.push($("#arms_list option:selected").attr("data-id"));
	armor_list.push($("#waist_list option:selected").attr("data-id"));
	armor_list.push($("#legs_list option:selected").attr("data-id"));
	armor_list.push($("#charm_list > option:selected").attr("data-id"));

	if($("#head_list option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#head_list option:selected").attr("data-skills") + ",\"head\"]"));
		
		if($("#head_list option:selected").attr("data-set-skills")){
			set_id = $("#head_list option:selected").attr("data-set-skills");

			if(final_bonus_skills[set_id]){
				final_bonus_skills[set_id].head = 1;
				final_bonus_skills[set_id].total += 1;
			}else{
				final_bonus_skills[set_id] = {"head": 1, "chest": 0, "arms": 0, "waist": 0, "legs": 0, "total": 1};
			}
		}
	}

	if($("#chest_list option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#chest_list option:selected").attr("data-skills") + ",\"chest\"]"));

		if($("#chest_list option:selected").attr("data-set-skills")){
			set_id = $("#chest_list option:selected").attr("data-set-skills");

			if(final_bonus_skills[set_id]){
				final_bonus_skills[set_id].chest = 1;
				final_bonus_skills[set_id].total += 1;
			}else{
				final_bonus_skills[set_id] = {"head": 0, "chest": 1, "arms": 0, "waist": 0, "legs": 0, "total": 1};
			}
		}
	}

	if($("#arms_list option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#arms_list option:selected").attr("data-skills") + ",\"arms\"]"));

		if($("#arms_list option:selected").attr("data-set-skills")){
			set_id = $("#arms_list option:selected").attr("data-set-skills");

			if(final_bonus_skills[set_id]){
				final_bonus_skills[set_id].arms = 1;
				final_bonus_skills[set_id].total += 1;
			}else{
				final_bonus_skills[set_id] = {"head": 0, "chest": 0, "arms": 1, "waist": 0, "legs": 0, "total": 1};
			}
		}
	}

	if($("#waist_list option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#waist_list option:selected").attr("data-skills") + ",\"waist\"]"));

		if($("#waist_list option:selected").attr("data-set-skills")){
			set_id = $("#waist_list option:selected").attr("data-set-skills");

			if(final_bonus_skills[set_id]){
				final_bonus_skills[set_id].waist = 1;
				final_bonus_skills[set_id].total += 1;
			}else{
				final_bonus_skills[set_id] = {"head": 0, "chest": 0, "arms": 0, "waist": 1, "legs": 0, "total": 1};
			}
		}
	}

	if($("#legs_list option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#legs_list option:selected").attr("data-skills") + ",\"legs\"]"));

		if($("#legs_list option:selected").attr("data-set-skills")){
			set_id = $("#legs_list option:selected").attr("data-set-skills");

			if(final_bonus_skills[set_id]){
				final_bonus_skills[set_id].legs = 1;
				final_bonus_skills[set_id].total += 1;
			}else{
				final_bonus_skills[set_id] = {"head": 0, "chest": 0, "arms": 0, "waist": 0, "legs": 1, "total": 1};
			}
		}
	}

	if($("#charm_list > option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#charm_list > option:selected").attr("data-skills") + ",\"charm\"]"));
	}

	$(".armor_slot").each(function(){
		if($(this).find("option:selected").attr("data-skills")){
			set_skills.push(JSON.parse("[" + $(this).find("option:selected").attr("data-skills") + ",\"deco\"]"));
		}

		armor_list.push($(this).find("option:selected").attr("data-id"));
	});

	for(item in set_skills){
		one_piece = set_skills[item];

		for(skill_item in one_piece){
			if(skill_item < (one_piece.length - 1)){
				if(final_skills[one_piece[skill_item][0]]){
					final_skills[one_piece[skill_item][0]].level += one_piece[skill_item][1];
					final_skills[one_piece[skill_item][0]].pieces[one_piece[one_piece.length - 1]] += one_piece[skill_item][1];
				}else{
					final_skills[one_piece[skill_item][0]] = {"level": one_piece[skill_item][1], "pieces":{"head": 0, "chest": 0, "arms": 0, "waist": 0, "legs": 0, "charm": 0, "deco": 0}};
					final_skills[one_piece[skill_item][0]].pieces[one_piece[one_piece.length - 1]] += one_piece[skill_item][1];
				}
			}
		}
	}

	createSkillList(final_skills, final_bonus_skills);
	createSetInfo();
	$("#share_btn").attr("data-clipboard-text", (window.location.origin + window.location.pathname) + "?" + btoa(armor_list));
	new Clipboard("#share_btn");
}

function createSkillList(skill_list, set_skill_list){
	skills_result = "";

	for(skill in set_skill_list){
		total_points = set_skill_list[skill].total;

		for(item in set_bonus[skill].skills){
			bonus_skill = set_bonus[skill].skills[item];
			skill_points = "";

			for(part in set_skill_list[skill]){
				if(part != "total"){
					if(set_skill_list[skill][part] > 0){
						skill_points += "<img src=\"img/" + part + ".png\" class=\"armor_icon mx-1\" />";
					}else{
						skill_points += "<img src=\"img/" + part + "_off.png\" class=\"armor_icon mx-1\" />";
					}
				}
			}

			if(total_points >= bonus_skill.level){
				skills_result += "<div class=\"row py-1\"><div class=\"skill_item col\"><div class=\"row px-2 py-1 text-light\"><span class=\"text-warning font-weight-bold mr-1\">" + bonus_skill.level + "</span>" + skills[bonus_skill.id].name + "</div><div class=\"row\"><div class=\"col\"><hr class=\"bg-light mt-1 mb-2\" /></div></div><div class=\"armor_levels row px-2 pt-0 pb-1 align-items-center justify-content-center text-warning\">" + skill_points + "</div></div></div>";
			}
		}
	}

	for(skill in skill_list){
		skill_level = "";
		skill_points = "";

		for(i = 0; i < skill_list[skill].level; i++){
			if(i < skills[skill].max_level){
				skill_level += "<span class=\"skill_lvl selected_lvl\"></span>";
			}
		}

		for(i = 0; i < (skills[skill].max_level - skill_list[skill].level); i++){
			skill_level += "<span class=\"skill_lvl\"></span>";
		}

		for(piece in skill_list[skill].pieces){
			if(skill_list[skill].pieces[piece] > 0){
				skill_points += "<img src=\"img/" + piece + ".png\" class=\"armor_icon ml-2 mr-1\" /><span class=\"text-warning\">" + skill_list[skill].pieces[piece] + "</span>";
			}else{
				skill_points += "<img src=\"img/" + piece + "_off.png\" class=\"armor_icon ml-2 mr-1\" /><span class=\"text-muted\">" + skill_list[skill].pieces[piece] + "</span>";
			}
		}

		skills_result += "<div class=\"row py-1\"><div class=\"skill_item col\"><div class=\"row px-2 py-1 text-light\">" + skills[skill].name + "</div><div class=\"row px-2 pt-0 pb-1\">" + skill_level + "</div><div class=\"row\"><div class=\"col\"><hr class=\"bg-light mt-1 mb-2\" /></div></div><div class=\"armor_levels row px-2 pt-0 pb-1 align-items-center justify-content-end text-warning\">" + skill_points + "</div></div></div>";
	}

	$("#skills").html(skills_result);
}

function createSetInfo(){
	armor_pieces = [armor[$("#head_list option:selected").attr("data-id")], armor[$("#chest_list option:selected").attr("data-id")], armor[$("#arms_list option:selected").attr("data-id")], armor[$("#waist_list option:selected").attr("data-id")], armor[$("#legs_list option:selected").attr("data-id")]];
	final_info = {
		"defense": 0, 
		"defense_max": 0, 
		"defense_augment": 0, 
		"resist_ice": [0, "text-light"], 
		"resist_fire": [0, "text-light"], 
		"resist_thunder": [0, "text-light"], 
		"resist_water": [0, "text-light"], 
		"resist_dragon": [0, "text-light"]
	};

	for(piece in armor_pieces){
		final_info.defense += armor_pieces[piece].defense;
		final_info.defense_max += armor_pieces[piece].defense_max;
		final_info.defense_augment += armor_pieces[piece].defense_augment;

		final_info.resist_ice[0] += armor_pieces[piece].ice_resist ? armor_pieces[piece].ice_resist : 0;
		if(final_info.resist_ice[0] != 0){
			if(final_info.resist_ice[0] > 0){
				final_info.resist_ice[1] = "text-success";
			}else{
				final_info.resist_ice[1] = "text-danger";
			}
		}else{
			final_info.resist_ice[1] = "text-light";
		}

		final_info.resist_fire[0] += armor_pieces[piece].fire_resist ? armor_pieces[piece].fire_resist : 0;
		if(final_info.resist_fire[0] != 0){
			if(final_info.resist_fire[0] > 0){
				final_info.resist_fire[1] = "text-success";
			}else{
				final_info.resist_fire[1] = "text-danger";
			}
		}else{
			final_info.resist_fire[1] = "text-light";
		}

		final_info.resist_thunder[0] += armor_pieces[piece].thunder_resist ? armor_pieces[piece].thunder_resist : 0;
		if(final_info.resist_thunder[0] != 0){
			if(final_info.resist_thunder[0] > 0){
				final_info.resist_thunder[1] = "text-success";
			}else{
				final_info.resist_thunder[1] = "text-danger";
			}
		}else{
			final_info.resist_thunder[1] = "text-light";
		}

		final_info.resist_water[0] += armor_pieces[piece].water_resist ? armor_pieces[piece].water_resist : 0;
		if(final_info.resist_water[0] != 0){
			if(final_info.resist_water[0] > 0){
				final_info.resist_water[1] = "text-success";
			}else{
				final_info.resist_water[1] = "text-danger";
			}
		}else{
			final_info.resist_water[1] = "text-light";
		}

		final_info.resist_dragon[0] += armor_pieces[piece].dragon_resist ? armor_pieces[piece].dragon_resist : 0;
		if(final_info.resist_dragon[0] != 0){
			if(final_info.resist_dragon[0] > 0){
				final_info.resist_dragon[1] = "text-success";
			}else{
				final_info.resist_dragon[1] = "text-danger";
			}
		}else{
			final_info.resist_dragon[1] = "text-light";
		}
	}

	$("#def_min").text(final_info.defense);
	$("#def_max").text(final_info.defense_max);
	$("#def_aug").text(final_info.defense_augment);
	$("#element_values > div:eq(0)").removeClass("text-light text-success text-danger").addClass(final_info.resist_fire[1]).text(final_info.resist_fire[0]);
	$("#element_values > div:eq(1)").removeClass("text-light text-success text-danger").addClass(final_info.resist_water[1]).text(final_info.resist_water[0]);
	$("#element_values > div:eq(2)").removeClass("text-light text-success text-danger").addClass(final_info.resist_thunder[1]).text(final_info.resist_thunder[0]);
	$("#element_values > div:eq(3)").removeClass("text-light text-success text-danger").addClass(final_info.resist_ice[1]).text(final_info.resist_ice[0]);
	$("#element_values > div:eq(4)").removeClass("text-light text-success text-danger").addClass(final_info.resist_dragon[1]).text(final_info.resist_dragon[0]);
}

function saveSet(){
	if($("#save_id").val() != ""){
		save_id = $("#save_id").val();
	}else{
		save_id = new Date().getTime();
	}

	if($("#set_name").val() != ""){
		set_name = $("#set_name").val();
	}else{
		set_name = "New set";
	}

	if(localStorage.getItem("armor_sets") === null){
		save_obj = {};
		save_obj[save_id] = {"name": set_name, "set": btoa(armor_list)};

		localStorage.armor_sets = JSON.stringify(save_obj);
	}else{
		save_obj = JSON.parse(localStorage.getItem("armor_sets"));
		save_obj[save_id] = {"name": set_name, "set": btoa(armor_list)};

		localStorage.armor_sets = JSON.stringify(save_obj);
	}

	showToast("Set saved.")
	savedSets();
}

function deleteSet(save_id){
	save_obj = JSON.parse(localStorage.getItem("armor_sets"));
	delete save_obj[save_id];

	localStorage.armor_sets = JSON.stringify(save_obj);

	showToast("Set deleted.")
	savedSets();
}

function newSet(){
	$("#save_id").val("");
	$("#set_name").val("");

	$("#weapon_list > select:eq(0) option:eq(0)")[0].selected = true;
	$("#weapon_list > select:eq(0) option:eq(0)").trigger("change");

	$("#weapon_list > select:eq(1) option:eq(0)")[0].selected = true;
	$("#weapon_list > select:eq(1) option:eq(0)").trigger("change");

	$("#weapon_list > select:eq(2) option:eq(0)")[0].selected = true;
	$("#weapon_list > select:eq(2) option:eq(0)").trigger("change");

	$("#head_list option:eq(0)")[0].selected = true;
	$("#head_list option:eq(0)").trigger("change");

	$("#chest_list option:eq(0)")[0].selected = true;
	$("#chest_list option:eq(0)").trigger("change");

	$("#arms_list option:eq(0)")[0].selected = true;
	$("#arms_list option:eq(0)").trigger("change");

	$("#waist_list option:eq(0)")[0].selected = true;
	$("#waist_list option:eq(0)").trigger("change");

	$("#legs_list option:eq(0)")[0].selected = true;
	$("#legs_list option:eq(0)").trigger("change");

	$("#charm_list option:eq(0)")[0].selected = true;
	$("#charm_list option:eq(0)").trigger("change");
}
