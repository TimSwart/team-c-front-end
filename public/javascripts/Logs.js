/**
 * Created by Trevor on 7/20/2015.
 */
var counter = 0;
function DisplayNext(log, currId) {

    var rowToCopy = $('.InputChild').first();
    var rowsContainer = '#InputDiv';

    var clonedRow = rowToCopy.clone();
    if (counter == 0)
    {
        $('.InputChild').first().remove();
    }
    clonedRow.find('label').prop('id', 'log' + counter);
    clonedRow.find('input:checkbox').prop('id', currId);
    clonedRow.find('label').text(log);

    counter++;

    clonedRow.appendTo(rowsContainer);

}

var DisplayAll =
{
    Now: function () {
        counter = 0;
        var host = window.apiRoute + "/getLogs/";


        $.get(host, function (logsForUsername) {
            var logsObj = JSON.parse(logsForUsername);
            var logs = logsObj.logs;


            for (var i = logs.length -1; i >= 100; i--) {

                var log = logs[i];
                var currId = logsObj.id[i];
                DisplayNext(log, currId);
            }

        });
    },

    Ignore: function () {
        var checkedBoxes = [];

        $("input:checkbox").each(function(){
            var $this = $(this);

            if($this.is(":checked")){
                var push = $this.attr("id");
                checkedBoxes.push(push);
                alert(push);
                var host = window.apiRoute + "/Logging/AddLogViewMapEntry/" + push+ "/";
                $.get(host, function (queryResult) {
                    alert(queryResult);
                });
            }
        });
    }
};