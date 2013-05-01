(function ($) {
    $(document).ready(function() {


        var Item = function(Id, Title, Doc, Type, Hm, Embed) {
            if (!Hm) { this.Hm = {}; } else { this.Hm = Hm };
            if (!Embed) { this.Embed = {}; } else { this.Embed = Embed; }
            if (!Doc) { this.Doc = {}; } else { this.Doc = Doc; }
            this.hmid = "1000";
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

        itemArray.push(new Item(0, "Test1"));



    });
})(jQuery);