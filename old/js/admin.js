(function ($) {
    $(document).ready(function() {


        var Item = function(Id, Title, Doc, Type, Hm, Embed) {
            if (!Hm) { this.Hm = {}; } else { this.Hm = Hm };
            if (!Embed) { this.Embed = {}; } else { this.Embed = Embed; }
            if (!Doc) { this.Doc = {}; } else { this.Doc = Doc; }

            this.Id = Id;
            this.Title = Title;
            this.Type = Type;

            this.Doc.id = function() {
                return "item" + this.parent().get("Id");
            }
            this.Doc.style = {

            }
        }


        var nextId = 0;
        var itemArray = new kendo.data.ObservableArray([]);
        var itemsVm = kendo.observable({
            Items: itemArray
        });
        var editItemVm = kendo.observable({
            Id: ""
        });
        kendo.bind($("#container"), itemsVm);


        var addItemButton = $("#addItemButton").bind("click", function() {
            console.log("addItemButton click");
            var itemTmp = new Item(nextId, "Element " + nextId);
            itemArray.push(itemTmp);



            setDraggable($("div#item" + nextId));
            setDblclick($("div#item" + nextId));
            nextId += 1;
        });

        var windowTools = $("#windowTools").kendoWindow({
            width: "400px",
            height: "600px",
            title: "Tools",
            close: undefined,
            modal: false
        });


        var tabsCss = $("#tabsCss").kendoTabStrip({
            animation:	{
                open: {
                    effects: "fadeIn"
                }
            }

        }).data("kendoTabStrip");



        function setDblclick(obj) {
            obj.dblclick(function() {
                var idTmp = $(this).attr("id").slice(4);
                //itemArray[idTmp].Doc.style.top = $(this).css("top");
                //itemArray[idTmp].Doc.style.left = $(this).css("left");

                editItemVm = kendo.observable(itemArray);
                kendo.bind($("#windowTools"), editItemVm[idTmp]);
                console.log(editItemVm);

            });
        }
        function setDraggable(obj) {
            obj.draggable({
                containment: "#container",
                stop: function(e, ui) {
                    refreshItemStyle(ui.helper[0].id);
                }
            }).resizable({
                stop: function(e, ui) {
                    refreshItemStyle(ui.helper[0].id);
                }
            });
        }
        function refreshItemStyle(id) {
            var idTmp = id.slice(4);
            var itemObj = $("#"+id)
            itemArray[idTmp].Doc.style.top = itemObj.css("top");
            itemArray[idTmp].Doc.style.left = itemObj.css("left");
            itemArray[idTmp].Doc.style.width = itemObj.css("width");
            itemArray[idTmp].Doc.style.height = itemObj.css("height");
        }
    });
})(jQuery);