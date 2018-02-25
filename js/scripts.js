$(document).ready(function(){
	loadPieces();
	savedSets();

	if(location.search){
		parseSet((location.search).substr(1));
	}else{
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

function toggleMenu(){
	if(!$("#menu").hasClass("menu_show")){
		$("#menu").animate({"right": "-=" + $("#menu").outerWidth()});
		$("#title_bar").animate({"width": "-=" + $("#menu").outerWidth()});
		$("#menu").toggleClass("menu_show");
	}else{
		$("#title_bar").animate({"width": "+=" + $("#menu").outerWidth()});
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
	}
}

function parseSet(custom_set_string, set_id){
	custom_set_string = atob(custom_set_string);
	custom_set = custom_set_string.split(",");

	if(set_id){
		$("#save_id").val(set_id);
		
		save_obj = JSON.parse(localStorage.getItem("armor_sets"));
		$("#set_name").val(save_obj[set_id].name);
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

	buildSet();
}

function loadPieces(){
	head_pieces = "";
	chest_pieces = "";
	arms_pieces = "";
	waist_pieces = "";
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

				head_pieces += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\">" + armor[piece].name + "</option>";

				break;
			case("chest"):
				piece_skills = armor[piece].skills;
				piece_slots = armor[piece].slots;

				piece_skills_list = "";
				piece_slots_list = "";

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

				chest_pieces += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\">" + armor[piece].name + "</option>";

				break;
			case("arms"):
				piece_skills = armor[piece].skills;
				piece_slots = armor[piece].slots;

				piece_skills_list = "";
				piece_slots_list = "";

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

				arms_pieces += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\">" + armor[piece].name + "</option>";

				break;
			case("waist"):
				piece_skills = armor[piece].skills;
				piece_slots = armor[piece].slots;

				piece_skills_list = "";
				piece_slots_list = "";

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

				waist_pieces += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\">" + armor[piece].name + "</option>";

				break;
			case("legs"):
				piece_skills = armor[piece].skills;
				piece_slots = armor[piece].slots;

				piece_skills_list = "";
				piece_slots_list = "";

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

				legs_pieces += "<option data-id=\"" + piece + "\" data-skills=\"" + piece_skills_list + "\" data-slots=\"" + piece_slots_list + "\">" + armor[piece].name + "</option>";

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

		deco_pieces[deco_item.level] = deco_pieces[deco_item.level] + "<option data-id=\"" + deco_item.skills[0].id + "\" data-skills=\"[" + deco_item.skills[0].id + "," + deco_item.skills[0].level + "]\">" + skills[deco_item.skills[0].id].name + " Jewel</option>";
	}

	deco_pieces[1] = "<optgroup label=\"Level 1\">" + deco_pieces[1] + "</optgroup>";
	deco_pieces[2] = "<optgroup label=\"Level 2\">" + deco_pieces[2] + "</optgroup>";
	deco_pieces[3] = "<optgroup label=\"Level 3\">" + deco_pieces[3] + "</optgroup>";

	$("#head_list").html(head_pieces);
	$("#chest_list").html(chest_pieces);
	$("#arms_list").html(arms_pieces);
	$("#waist_list").html(waist_pieces);
	$("#legs_list").html(legs_pieces);
	$("#charm_list").html(charm_pieces);
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

	buildSet();
}

function buildSet(){
	set_skills = [];
	final_skills = {};
	armor_list = [];

	//console.log($("#weapon_list > select:eq(0) > option:selected").attr("data-id"));
	//console.log($("#weapon_list > select:eq(1) > option:selected").attr("data-id"));
	//console.log($("#weapon_list > select:eq(2) > option:selected").attr("data-id"));
	armor_list.push($("#weapon_list > select:eq(0) > option:selected").attr("data-id"));
	armor_list.push($("#weapon_list > select:eq(1) > option:selected").attr("data-id"));
	armor_list.push($("#weapon_list > select:eq(2) > option:selected").attr("data-id"));
	armor_list.push($("#head_list > option:selected").attr("data-id"));
	armor_list.push($("#chest_list > option:selected").attr("data-id"));
	armor_list.push($("#arms_list > option:selected").attr("data-id"));
	armor_list.push($("#waist_list > option:selected").attr("data-id"));
	armor_list.push($("#legs_list > option:selected").attr("data-id"));
	armor_list.push($("#charm_list > option:selected").attr("data-id"));

	if($("#head_list > option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#head_list > option:selected").attr("data-skills") + "]"));
	}

	if($("#chest_list > option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#chest_list > option:selected").attr("data-skills") + "]"));
	}

	if($("#arms_list > option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#arms_list > option:selected").attr("data-skills") + "]"));
	}

	if($("#waist_list > option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#waist_list > option:selected").attr("data-skills") + "]"));
	}

	if($("#legs_list > option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#legs_list > option:selected").attr("data-skills") + "]"));
	}

	if($("#charm_list > option:selected").attr("data-skills")){
		set_skills.push(JSON.parse("[" + $("#charm_list > option:selected").attr("data-skills") + "]"));
	}

	$(".armor_slot").each(function(){
		if($(this).find("option:selected").attr("data-skills")){
			set_skills.push(JSON.parse("[" + $(this).find("option:selected").attr("data-skills") + "]"));
		}

		armor_list.push($(this).find("option:selected").attr("data-id"));
	});

	for(item in set_skills){
		one_piece = set_skills[item];

		for(skill_item in one_piece){
			if(final_skills[one_piece[skill_item][0]]){
				final_skills[one_piece[skill_item][0]] += one_piece[skill_item][1];
			}else{
				final_skills[one_piece[skill_item][0]] = one_piece[skill_item][1];
			}
		}
	}

	createSkillList(final_skills);
	$("#share_btn").attr("data-clipboard-text", (window.location.origin + window.location.pathname) + "?" + btoa(armor_list));
	new Clipboard("#share_btn");
}

function createSkillList(skill_list){
	skills_result = "";

	for(skill in skill_list){
		skill_level = "";

		for(i = 0; i < skill_list[skill]; i++){
			if(i < skills[skill].max_level){
				skill_level += "<span class=\"skill_lvl selected_lvl\"></span>";
			}
		}

		for(i = 0; i < (skills[skill].max_level - skill_list[skill]); i++){
			skill_level += "<span class=\"skill_lvl\"></span>";
		}

		skills_result += "<div class=\"row py-1\"><div class=\"skill_item col\"><div class=\"row px-2 py-1 text-light\">" + skills[skill].name + "</div><div class=\"row px-2 pt-0 pb-1\">" + skill_level + "</div></div></div>";
	}

	$("#skills").html(skills_result);
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

	savedSets();
}

function deleteSet(save_id){
	save_obj = JSON.parse(localStorage.getItem("armor_sets"));
	delete save_obj[save_id];

	localStorage.armor_sets = JSON.stringify(save_obj);
	
	savedSets();
}

function newSet(){
	$("#save_id").val("");
	$("#set_name").val("");

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