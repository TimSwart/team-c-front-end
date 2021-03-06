var itemDetailView = {
    productID: null,
    item: null,

    init: function () {
        $("#response").text("");
        this.productID = window.args.ProductID || window.state.ProductID || window.args.pageKey;

        if (window.args.ProductID) {
            navigation.saveState(window.args);
        }

        var self = this;

        navigation.get(window.apiRoute + "/itemDetail/" + this.productID, function (err, response) {
            if(err){
                self.renderError("Failed to load inventory: " + response);
            }
            else if (response && response.length) {
                self.item = jQuery.parseJSON(response)[0];
                //console.log(self.item);
                self.productName = self.item.Name;
                self.displayItem();
                self.doThumbnail();
                navigation.setTitle("Product Details: " + self.productName);
            } else {
                self.renderError("No inventory found");
            }
        });

        navigation.get("/GetRunsByProduct/" + this.productID, function (err, response) {
           if (response && response.length) {
               self.runs = jQuery.parseJSON(response);
               //console.log(response);
               if (response.length > 2) {
                   self.displayRuns();
               }
           } else {
               self.renderError("No runs to display");
           }
        });
    },

    displayItem: function () {

        var lastRunDate = this.item.MostRecent;
        var dateString;

        if (lastRunDate != 'n/a')
        {
            lastRunDate = new Date(lastRunDate);
            dateString = lastRunDate.getMonth() + "/" + lastRunDate.getDay() + "/" + lastRunDate.getFullYear() + " ";
            var hhmm = (lastRunDate.getHours() != 0) ? lastRunDate.getHours() : "00";
            hhmm += ":";
            hhmm += (lastRunDate.getMinutes() != 0) ? lastRunDate.getMinutes() : "00";
            lastRunDate = dateString + hhmm;
        }

        $("#response").text("");
        $("#product_name").text(this.item.Name);
        $("#details").append("<div>Total Available: <span>" + this.item.TotalAvailable + "</span></div>" +
        "<div>Total Reserved: <span>" + this.item.TotalReserved + "</span></div>" +
        "<div>Last run: <span>" + lastRunDate + "</span></div>");
    },

    displayRuns: function () {
        $("#runs").append("<h2>" + "Run History" + "</h2>" +
                          "<div class=\"col-sm-12\">" + "<b>" + "<div class=\"col-sm-1\">" + "Run ID" + "</div>" + "<div class=\"col-sm-1\">" + "Alt ID" + "</div>" + "<div class=\"col-sm-2\">" + "Date Created" + "</div>" + "<div class=\"col-sm-2\">" + "Location" + "</div>" + "<div class=\"col-sm-5\">" + "<div class=\"col-sm-4\">" + "Initial Quantity" + "</div>" + "<div class=\"col-sm-4\">" + "Quantity Available" + "</div>" + "<div class=\"col-sm-4\">" + "Quantity Reserved" + "</div>" + "</div>" + "<div class=\"col-sm-1\">" + "Color" + "</div>" + "</b>" + "</div>");
        var displayColor = 0;  // used to set background of every other row
        this.runs.forEach(function (run) {
            if (displayColor % 2 == 0) {
                $("#runs").append("<div style=\"background:lightgray\" class=\"col-sm-12\">" + "<div class=\"col-sm-1\">" + run.RunID + "</div>" + "<div class=\"col-sm-1\">" + run.AltID + "</div>" + "<div class=\"col-sm-2\">" + formatDate(run.DateCreated) + "</div>" + "<div class=\"col-sm-2\">" + run.Location + "</div>" + "<div class=\"col-sm-5\">" + "<div class=\"col-sm-4\">" + run.InitialQuantity + "</div>" + "<div class=\"col-sm-4\">" + run.QuantityAvailable + "</div>" + "<div class=\"col-sm-4\">" + run.QuantityReserved + "</div>" + "</div>" + "<div class=\"col-sm-1\">" + run.Marker + "</div>" + "</div>");
                ++displayColor;
            } else {
                $("#runs").append("<div class=\"col-sm-12\">" + "<div class=\"col-sm-1\">" + run.RunID + "</div>" + "<div class=\"col-sm-1\">" + run.AltID + "</div>" + "<div class=\"col-sm-2\">" + formatDate(run.DateCreated) + "</div>" + "<div class=\"col-sm-2\">" + run.Location + "</div>" + "<div class=\"col-sm-5\">" + "<div class=\"col-sm-4\">" + run.InitialQuantity + "</div>" + "<div class=\"col-sm-4\">" + run.QuantityAvailable + "</div>" + "<div class=\"col-sm-4\">" + run.QuantityReserved + "</div>" + "</div>" + "<div class=\"col-sm-1\">" + run.Marker + "</div>" + "</div>");
                ++displayColor;
            }
        });

        function formatDate(date) {
            var dateString;
            var dateRegex = /\d\d\d\d-\d\d-\d\d/;
            dateString = dateRegex.exec(date).toString();
            var dateArray = dateString.split("-");
            dateString = dateArray[1] + "/" + dateArray[2] + "/" + dateArray[0];
            return dateString;
        }
    },

    renderError: function (error) {
        $("#response").text("Error: " + error);
    },

    add: function () {
        if (!this.productID || !this.item) return;
        navigation.go("AddInventory.html", {
            ProductID: this.productID,
            ProductName: this.item.Name || ""
        });
    },

    pull: function () {
        if (!this.productID || !this.item) return;
        navigation.go("ViewCarts.html", {
            ProductID: window.args.ProductID,
            ProductName: this.item.Name || "",
            TotalQuantity: this.item.TotalAvailable
        });
    },

    edit: function () {
        if (!this.productID || !this.item) return;
        navigation.go("EditProduct.html", {
            ProductID: this.productID,
            ProductName: this.item.Name || ""
        });
    },

    qrCode: function () {
        if (!this.productID || !this.item) return;
        navigation.go("ShowQRCode.html", {
            Text: window.location.protocol + "//" + window.location.hostname + "/" + "ItemDetailView-" + this.productID
        });
    },

    Delete: function() {
        var productID = window.args.ProductID;
        navigation.get(window.apiRoute + "/DeleteProductByID/" + productID, function (err, resp) {
            if(err){
                $("#response").text( "Fail to delete product: Error --- " + res );
            }
            var r = jQuery.parseJSON(resp);
            if (r[0].message == 'Success') {
                alert("Product " + $("#product_name").text() + " is deleted.");
                navigation.go("DisplayInventory.html",{ProductID: window.args.ProductID});
            }
            else {
                alert(r[0].message);
                //$("#response").append("<br/>" + "Deleting Product is only available to system admin.");
                //$("#response").append("<br/>" + "Please go through the following checklist before deleting product.");
                //$("#response").append("<br/>" + "1. Inventory of the product is 0.");
                //$("#response").append("<br/>" + "2. De-associate all customers from the product");
            }
        });
    },

     doThumbnail: function() {

         var imageLocation = navigation.makeImageURL(this.productID);

         navigation.checkImage( imageLocation,
            function(){
                console.log("Image found for product");
                $('.thumbnail').html("<img src='"+imageLocation+"'/>");
            },
            function(){
                console.log("No image found for product");
                $('.thumbnail').html("<div class='noImage'>No Image</div>");
            });

    },
};
