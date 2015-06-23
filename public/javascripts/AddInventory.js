//<script>
var addInventory = {
    productId: 0,
    itemName: "",
    packageTypes: [],
    locations: [],
    total: 0,

    // Initialize the page.
    init: function() {
        this.productId = parseInt(window.args.ProductID) || 0;

        if (this.productId == 0) {
            $("#response").text("Error: Init: Invalid product ID.");
            return;
        }

        $.get(window.apiRoute + "/getItemName/" + this.productId, function(res) {
            if (res && res.length) {
                addInventory.itemName = $.parseJSON(res)[0].Name;
                $("#item_text").text(addInventory.itemName);
            } else {
                $("#response").text("Error: Init: No response.");
            }
        }).fail(function(res) {
            $("#response").text("Error: Init: Connection error.");
        });

        this.updatePackageTypes();
        this.updateLocations();
    },

    // Add a row of add inventory entry.
    addEntry: function() {
        var entry = $(document.createElement("div"))
            .appendTo("#add_list");

        // package type input
        var select = $(document.createElement("select"))
            .attr("name", "package_input")
            .attr("onchange", "addInventory.updateTotal()")
            .appendTo(entry);

        this.updateEntryPackageTypeOptions(select);

        entry.append(" * ");

        // amount input
        input = $(document.createElement("input"))
            .attr("name", "amount_input")
            .attr("type", "text")
            .attr("onkeyup", "addInventory.updateTotal()")
            .appendTo(entry);

        // count
        var countOf = $(document.createElement("span"))
            .attr("name", "count_of_text")
            .addClass("float_right")
            .append(" = Count of ")
            .appendTo(entry);

        var count = $(document.createElement("span"))
            .attr("name", "count_text")
            .text("0")
            .appendTo(countOf);

        entry.append("<div style='clear: both;'></div>");
    },

    // Array of entries (all string)
    getEntries: function() {
        var entries = [];

        $("#add_list").children().each(function() {
            entries.push({
                itemName: addInventory.getItemName(),
                productId: addInventory.getProductId(),
                location: addInventory.getSelectedLocation(),
                pileId: addInventory.getSelectedPileId(),
                packageName: $(this).children("select[name='package_input']").children("option:selected").data("name"),
                packageSize: $(this).children("select[name='package_input']").children("option:selected").data("size"),
                amount: $(this).children("input[name='amount_input']").val(),
                count: $(this).children("span[name='count_of_text']").children("span[name='count_text']").text()
            });
        });

        return entries;
    },

    getProductId: function() {
        return this.productId;
    },

    getSelectedPileId: function() {
        return $("#location_input").children("option:selected").data("id");
    },

    getSelectedLocation: function() {
        return $("#location_input").children("option:selected").val();
    },

    getItemName: function() {
        return this.itemName;
    },

    getPackageTypes: function() {
        return this.packageTypes;
    },

    getLocations: function() {
        return this.locations;
    },

    getTotal: function () {
        this.updateTotal();
        return this.total;
    },

    // Updates the current total and the total display.
    updateTotal: function() {
        this.total = 0;

        $("#add_list").children("div").each(function() { // each entry
            var size = parseInt($(this).children("select[name='package_input']").children("option:selected").data("size")) || 0;
            var amount = parseInt($(this).children("input[name='amount_input']").val()) || 0;
            var countOf = size * amount;
            $(this).children("span[name='count_of_text']").children("span[name='count_text']").text(countOf);
            addInventory.total += countOf;
        });

        $("#total_text").text(this.total);
    },

    // Updates the types of package available. Retrieves package types data from the back-end.
    updatePackageTypes: function() {
        $.get(window.apiRoute + "/getPackageTypes/" + this.getProductId(), function(res) {
            if (res && res.length) {
                addInventory.packageTypes = $.parseJSON(res);
                addInventory.updatePackageTypeOptions();
            } else {
                $("#response").text("Error: Update package types: No response.");
            }
        }).fail(function(res) {
            $("#response").text("Error: Update package types: Connection error.");
        });
    },

    // Updates the options for the package types.
    updatePackageTypeOptions: function() {
        $("#add_list").children().each(function() {
            var select = $(this).children("select[name='package_input']")
                .empty();

            addInventory.updateEntryPackageTypeOptions(select);
        });
    },

    // Updates the options for the package types of a single entry.
    updateEntryPackageTypeOptions: function(entry) {
        this.packageTypes.forEach(function(each) {
            var packageType = $(document.createElement("option"))
                .text(each.Name + " " + each.Size)
                .data("name", each.Name)
                .data("size", each.Size)
                .appendTo(entry);
        });
    },

    // Updates the locations available. Retrieves locations data from the back-end.
    updateLocations: function() {
        $.get(window.apiRoute + "/getLocations/" + this.getProductId(), function(res) {
            if (res && res.length) {
                addInventory.locations = $.parseJSON(res);
                addInventory.updateLocationOptions();
            } else {
                $("#response").text("Error: Update locations: No response.");
            }
        }).fail(function(res) {
            $("#response").text("Error: Update locations: Connection error.");
        });
    },

    // Updates the options for the locations.
    updateLocationOptions: function() {
        var select = $("#location_input")
            .empty();

        this.locations.forEach(function(each) {
            var location = $(document.createElement("option"))
                .text(each.Location)
                .data("id", each.PileID)
                .appendTo(select);
        });
    },

    // Submit add inventory.
    submitAdd: function() {
        this.getTotal();

        var pileId = $("#location_input").children("option:selected").data("id") || 0;

        if (this.getProductId() == 0 || this.getSelectedPileId() == 0 || this.getTotal() == 0) {
            $("#response").text("Error: Submit add inventory: Invalid input or ID.");
            return;
        }

        $.get(window.apiRoute + "/addInventory/" + this.getProductId() + "/" + this.getSelectedPileId() + "/" + this.getTotal(), function(res) {
            $("#response").text("Added inventory: " + addInventory.total + ".");
            navigation.go(window.args.PreviousPage, {ProductID: window.args.ProductID});
        }).fail(function(res) {
            $("#response").text("Error: Submit add inventory: Connection error.");
        });
    },

    // Submit new package type
    submitNewPackageType: function() {
        var name = $("#pkg_name").val() || "";
        var size = parseInt($("#pkg_size").val()) || 0;

        if (name == "" || size == 0) {
            $("#response").text("Error: Submit new package type: Invalid input.");
            return;
        }

        $.get(window.apiRoute + "/addPackageType/" + this.getProductId() + "/" + name + "/" + size, function(res) {
            $("#response").text("Added new package type: " + name + " " + size + ".");
            addInventory.updatePackageTypes();
        }).fail(function(res) {
            $("#response").text("Error: Submit new package type: Connection error.");
        });
    }
}
