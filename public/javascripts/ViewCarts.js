/**
 * Created by elijah on 6/21/15.
 */
var state = window.state;
function populateByCartId(){
    //TODO when users is able to be gotten dynamicly, change "don" to + userid; so it grabs the carts for the user
    $.get(window.apiRoute + "/Carts/GetCartsByUser/don", function(res) {
        if(res && res.length) {
            var dropSelect = document.getElementById("selectDropDown");
            var results = JSON.parse(res)[0];

            for(var i = 0; i < results.length; i++ ) {
                var option = document.createElement("option");
                option.value = results[i].CartID;
                if(!(typeof state === 'undefined')) {
                    if (results[i].CartName == state.nameSelected) {
                        option.attr = ("selected");
                    }
                }
                option.text = results[i].CartName;
                dropSelect.add(option);
            }
        }
        else {
                $("#response").text("Error: Init: No response.");
            }
        }).fail(function(res) {
             $("#response").text("Error: Init: Connection error.");
        });
}

function displayCartInventory(){
    $(".inventory-container").empty();
    var cartContainer = $(".inventory-container");
    var cartList = $(document.createElement("div"))
        .appendTo(cartContainer);
    console.log("nameselected:" + $("#selectDropDown :selected").text());

    state.nameSelected =$("#selectDropDown :selected").text();
    navigation.saveState(state);
    var idSelected = $("#selectDropDown :selected").value;

    $.get(window.apiRoute + "/Carts/GetCartItems/" + idSelected, function(res) {
        if (res && res.length) {
            var items = JSON.parse(res)[0];
            populateCartContainer(items);
        }
        else {
            $("#response").text("Error: Init: No response.");
        }
    }).fail(function(res) {
        $("#response").text("Error: Init: Connection error.");
    });
}

function gotoEditCarts(){
    if(typeof state === 'undefined'){
        $('#notSelected').text("Please choose a cart first!")
    }
    else{
        var cartSelected = $("#selectDropDown :selected").text();
        state.nameSelected =$("#selectDropDown :selected").text();
        navigation.saveState(state);
        var idSelected = $("#selectDropDown :selected").value;
        navigation.go('EditCartData.html',{cartID:idSelected, cartName:cartSelected});

    }
}

function populateCartContainer(items){
    $(".inventory-container").empty();
    var cartContainer = $(".inventory-container");
    var cartList = $(document.createElement("div"))
        .appendTo(cartContainer);
    for(var i = 0; i < items.length; i++){
        var name = items[i].ProductName.toString();
        var total = items[i].Total.toString();
        var sName  = items[i].SizeName.toString() + " of " + items[i].CountPerBatch.toString() + " * " + items[i].BatchCount.toString()+  " = " + total;
        var color = "Run Color/Marker  " + items[i].Marker.toString();
        var location = "Location:  "+ items[i].Location.toString();

        var cartItem = $(document.createElement("div"))
            .appendTo(cartList);
        $(document.createElement("hr"))
            .appendTo(cartItem);
        var productName = $(document.createElement("span"))
            .text(name)
            .addClass("productName")
            .appendTo(cartItem);
        var total = $(document.createElement("span"))
            .text(total)
            .addClass("float_right")
            .appendTo(cartItem);
        $(document.createElement("br"))
            .appendTo(cartItem);
        var sizeName = $(document.createElement("span"))
            .text(sName)
            .appendTo(cartItem);
        var runMarker = $(document.createElement("span"))
            .text(color)
            .appendTo(cartItem);
        var ilocation = $(document.createElement("span"))
            .text(location)
            .addClass("float_right")
            .appendTo(cartItem);
        cartList.append(cartItem);
    }
    cartContainer.append(cartList);
}