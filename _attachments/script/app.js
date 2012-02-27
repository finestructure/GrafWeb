// Apache 2.0 J Chris Anderson 2011
$(function() {   
    // friendly helper http://tinyurl.com/6aow6yn
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    var path = unescape(document.location.pathname).split('/'),
        design = path[3],
        db = $.couch.db(path[1]);
    function drawItems() {
        db.view(design + "/recent-items", {
            descending : "true",
            limit : 50,
            update_seq : true,
            success : function(data) {
                setupChanges(data.update_seq);
                console.log(data.rows.map(function(r) {return r.value;}));
                var them = $.mustache($("#recent-pictures").html(), {
                    items : data.rows.map(function(r) {return r.value;})
                });
                $("#content").html(them);
            }
        });
    };
    drawItems();
    // show form, when user clicked on picture or text
    $("li [class=no-form]").live("click", function(e) {
        $(this).parents("li").children("[class=no-form]").hide();
        var form = $(this).parents("li").children("[class=form]");
        form.show();
        form.find("[type=text]").focus();
    });
    // hide form when text input field no longer has the focus
    $("li [type=text]").live("blur", function(e) {
        var li = $(this).parents("li")
        li.children("[class=form]").hide();
        li.children("[class=no-form]").show();
    });
    // save any changes in the text fields
    $("li [type=text]").live("change", function(e) {
        var li = $(this).parents("li")
        var docid = li.attr("id");
        var new_text = this.value;
        db.openDoc(docid, {success : function(doc) {
            doc.text_result = new_text;
            db.saveDoc(doc)
        }});
    });



    var changesRunning = false;
    function setupChanges(since) {
        if (!changesRunning) {
            var changeHandler = db.changes(since);
            changesRunning = true;
            changeHandler.onChange(drawItems);
        }
    }
 });
