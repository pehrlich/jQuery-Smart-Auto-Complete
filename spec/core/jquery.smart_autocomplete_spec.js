describe('Smart AutoComplete', function () {
    
    beforeEach(function () {
       setFixtures("<input id='autoCompleteField'/>");
    });

    describe('initializing with default values', function(){

      var smart_autocomplete_options;

      beforeEach(function(){
        $("#autoCompleteField").smartAutoComplete({});
        smart_autocomplete_options = $("#autoCompleteField").data("smart-autocomplete");
      });

      it('minimum character length should be 2', function () {
        expect(smart_autocomplete_options.minCharLimit).toEqual(2);
      });

      it('maximum results should be unlimited', function () {
        expect(smart_autocomplete_options.maxResults).toEqual(-1);
      });

      it('delay should be 300ms', function () {
        expect(smart_autocomplete_options.delay).toEqual(300);
      });

      it('type ahead should be false', function () {
        expect(smart_autocomplete_options.typeAhead).toEqual(false);
      });

      it('disabled should be false', function () {
        expect(smart_autocomplete_options.disabled).toEqual(false);
      });

      it('force select should be false', function () {
        expect(smart_autocomplete_options.forceSelect).toEqual(false);
      });

    });

    describe('overriding default values', function(){

      it('takes hardcoded options', function(){
       setFixtures("<input id='autoCompleteFieldHardCoded' data-smart-autocomplete='{\"minCharLimit\": 4 }'/>");
       $("#autoCompleteFieldHardCoded").smartAutoComplete({});
       smart_autocomplete_options = $("#autoCompleteFieldHardCoded").data("smart-autocomplete");

       expect(smart_autocomplete_options.minCharLimit).toEqual(4);
      });

      it('minimum character limit set to 4', function () {
       $("#autoCompleteField").smartAutoComplete({minCharLimit: 4});
       smart_autocomplete_options = $("#autoCompleteField").data("smart-autocomplete");

       expect(smart_autocomplete_options.minCharLimit).toEqual(4);
      });

      it('maximum results set to 10', function () {
       $("#autoCompleteField").smartAutoComplete({maxResults: 10});
       smart_autocomplete_options = $("#autoCompleteField").data("smart-autocomplete");

       expect(smart_autocomplete_options.maxResults).toEqual(10);
      });

      it('delay set to 10ms', function () {
       $("#autoCompleteField").smartAutoComplete({delay: 10});
       smart_autocomplete_options = $("#autoCompleteField").data("smart-autocomplete");

       expect(smart_autocomplete_options.delay).toEqual(10);
      });

      it('type ahead set to true', function () {
       $("#autoCompleteField").smartAutoComplete({typeAhead: true});
       smart_autocomplete_options = $("#autoCompleteField").data("smart-autocomplete");

       expect(smart_autocomplete_options.typeAhead).toEqual(true);
      });

      it('disabled set to true', function () {
       $("#autoCompleteField").smartAutoComplete({disabled: true});
       smart_autocomplete_options = $("#autoCompleteField").data("smart-autocomplete");

       expect(smart_autocomplete_options.disabled).toEqual(true);
      });

      it('force select set to true', function () {
       $("#autoCompleteField").smartAutoComplete({forceSelect: true});
       smart_autocomplete_options = $("#autoCompleteField").data("smart-autocomplete");

       expect(smart_autocomplete_options.forceSelect).toEqual(true);
      });

    });

    describe('keyIn event', function(){

      it("performs no action if disabled", function(){
        $("#autoCompleteField").smartAutoComplete({disabled: true});
        //expect($("#autoCompleteField").trigger("keyIn")).toBeFalsy();
      });
      
      it("if custom filter function is defined, call it with query and source", function(){
        var output_buffer;
        $("#autoCompleteField").smartAutoComplete({filter: function(q, s){ output_buffer = "received " + q + " & " + s; }, source: "test"});
        $("#autoCompleteField").trigger("keyIn", "t");
        expect(output_buffer).toEqual("received t & test");
      });
  
      it("if custom filter function is not defined, call default filter with query and source", function(){
        var mock_autocomplete_obj = {filter: function(){}, source: 'test'};
        spyOn(mock_autocomplete_obj, 'filter');

        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").data("smart-autocomplete", mock_autocomplete_obj); //replace with the mock
        $("#autoCompleteField").trigger("keyIn", "t");

        expect(mock_autocomplete_obj.filter).toHaveBeenCalledWith('t', 'test');

      });

    });

    describe('filterReady event', function(){

      var result_formatter_called = false;
      var result_formatter_function = function(r){ result_formatter_called = true; return r };

      it("format the results using the result formatter function", function(){
        $("#autoCompleteField").smartAutoComplete({resultFormatter: result_formatter_function });
        $("#autoCompleteField").trigger('filterReady', [["a", "b", "c"]]);

        expect(result_formatter_called).toBeTruthy();
      });

      it("should remove previous results", function(){
        setFixtures("<input id='autoCompleteField'/><div id='autoCompleteAppendToBlock'><span class='smart_autocomplete_result'>test</span></div>");
        $("#autoCompleteField").smartAutoComplete({resultFormatter: result_formatter_function, resultsContainer: "#autoCompleteAppendToBlock" });
        $("#autoCompleteField").trigger('filterReady', [["a", "b", "c"]]);

        expect($("#autoCompleteAppendToBlock")).toHaveHtml("abc");
      });

      it("should append the results to given result container", function(){
        setFixtures("<input id='autoCompleteField'/><div id='autoCompleteAppendToBlock'></div>");
        $("#autoCompleteField").smartAutoComplete({resultFormatter: result_formatter_function, resultsContainer: "#autoCompleteAppendToBlock" });
        $("#autoCompleteField").trigger('filterReady', [["a", "b", "c"]]);

        expect($("#autoCompleteAppendToBlock")).toHaveHtml("abc");
      });

      it("should create a container and append the results if no result container is given", function(){
        $("#autoCompleteField").smartAutoComplete({resultFormatter: result_formatter_function });
        $("#autoCompleteField").trigger('filterReady', [["a", "b", "c"]]);

        expect($("._smart_autocomplete_container")).toHaveHtml("abc");

      });

      it("fires the show results event", function(){
        var event_output = "";
        $("#autoCompleteField").bind('showResults', function(){ event_output = "show results" });

        $("#autoCompleteField").smartAutoComplete({resultFormatter: result_formatter_function });
        $("#autoCompleteField").trigger('filterReady', [["a", "b", "c"]]);

        expect(event_output).toEqual("show results");
      });

      it("fires the no match event if filter returns empty", function(){
        var event_output = "";
        $("#autoCompleteField").bind('noMatch', function(){ event_output = "no match" });

        $("#autoCompleteField").smartAutoComplete({resultFormatter: result_formatter_function });
        $("#autoCompleteField").trigger('filterReady', [[]]);

        expect(event_output).toEqual("no match");
      }); 
    
    });

    describe('noMatch event', function(){

      it("should run the default handler if no custom handlers defined", function(){
        var mock_autocomplete_obj = {noMatch: function(){}};
        spyOn(mock_autocomplete_obj, 'noMatch');

        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").data("smart-autocomplete", mock_autocomplete_obj); //replace with the mock
        $("#autoCompleteField").trigger('noMatch');

        expect(mock_autocomplete_obj.noMatch).toHaveBeenCalled();
      }); 

      it("should not run the default handler if any custom handlers defined", function(){
        var mock_autocomplete_obj = {noMatch: function(){}};
        spyOn(mock_autocomplete_obj, 'noMatch');

        $("#autoCompleteField").bind('noMatch', function(){});
        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").data("smart-autocomplete", mock_autocomplete_obj); //replace with the mock
        $("#autoCompleteField").trigger('noMatch');

        expect(mock_autocomplete_obj.noMatch).not.toHaveBeenCalled();
      }); 

      it("should run all custom handlers defined", function(){
        var event_output = "";
        $("#autoCompleteField").bind('noMatch', function(){ event_output += "event1 "});
        $("#autoCompleteField").bind('noMatch', function(){ event_output += "event2"});

        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").trigger('noMatch');

        expect(event_output).toEqual("event1 event2");
      });

    });

    describe('showResults event', function(){

      it("should run the default handler if no custom handlers defined", function(){
        var mock_autocomplete_obj = {showResults: function(){}};
        spyOn(mock_autocomplete_obj, 'showResults');

        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").data("smart-autocomplete", mock_autocomplete_obj); //replace with the mock
        $("#autoCompleteField").trigger('showResults');

        expect(mock_autocomplete_obj.showResults).toHaveBeenCalled();
      }); 

      it("should not run the default handler if any custom handlers defined", function(){
        var mock_autocomplete_obj = {showResults: function(){}};
        spyOn(mock_autocomplete_obj, 'showResults');

        $("#autoCompleteField").bind('showResults', function(){});
        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").data("smart-autocomplete", mock_autocomplete_obj); //replace with the mock
        $("#autoCompleteField").trigger('showResults');

        expect(mock_autocomplete_obj.showResults).not.toHaveBeenCalled();
      }); 

      it("should run all custom handlers defined", function(){
        var event_output = "";
        $("#autoCompleteField").bind('showResults', function(){ event_output += "event1 "});
        $("#autoCompleteField").bind('showResults', function(){ event_output += "event2"});

        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").trigger('showResults');

        expect(event_output).toEqual("event1 event2");
      });

    });

    describe('hideResults event', function(){

      it("should run the default handler if no custom handlers defined", function(){
        var mock_autocomplete_obj = {hideResults: function(){}};
        spyOn(mock_autocomplete_obj, 'hideResults');

        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").data("smart-autocomplete", mock_autocomplete_obj); //replace with the mock
        $("#autoCompleteField").trigger('hideResults');

        expect(mock_autocomplete_obj.hideResults).toHaveBeenCalled();
      }); 

      it("should not run the default handler if any custom handlers defined", function(){
        var mock_autocomplete_obj = {hideResults: function(){}};
        spyOn(mock_autocomplete_obj, 'hideResults');

        $("#autoCompleteField").bind('hideResults', function(){});
        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").data("smart-autocomplete", mock_autocomplete_obj); //replace with the mock
        $("#autoCompleteField").trigger('hideResults');

        expect(mock_autocomplete_obj.hideResults).not.toHaveBeenCalled();
      }); 

      it("should run all custom handlers defined", function(){
        var event_output = "";
        $("#autoCompleteField").bind('hideResults', function(){ event_output += "event1 "});
        $("#autoCompleteField").bind('hideResults', function(){ event_output += "event2"});

        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").trigger('hideResults');

        expect(event_output).toEqual("event1 event2");
      });

    });

    describe('itemSelect event', function(){

      var selected_item = "mock item";

      it("should run the default handler if no custom handlers defined", function(){
        var mock_autocomplete_obj = {itemSelect: function(){}};
        spyOn(mock_autocomplete_obj, 'itemSelect');

        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").data("smart-autocomplete", mock_autocomplete_obj); //replace with the mock
        $("#autoCompleteField").trigger('itemSelect', selected_item);

        expect(mock_autocomplete_obj.itemSelect).toHaveBeenCalledWith(selected_item);
      }); 

      it("should not run the default handler if any custom handlers defined", function(){
        var mock_autocomplete_obj = {itemSelect: function(){}};
        spyOn(mock_autocomplete_obj, 'itemSelect');

        $("#autoCompleteField").bind('itemSelect', function(){});
        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").data("smart-autocomplete", mock_autocomplete_obj); //replace with the mock
        $("#autoCompleteField").trigger('itemSelect', selected_item);

        expect(mock_autocomplete_obj.itemSelect).not.toHaveBeenCalled();
      }); 

      it("should run all custom handlers defined", function(){
        var event_output = "";
        $("#autoCompleteField").bind('itemSelect', function(){ event_output += "event1 "});
        $("#autoCompleteField").bind('itemSelect', function(){ event_output += "event2"});

        $("#autoCompleteField").smartAutoComplete({});
        $("#autoCompleteField").trigger('itemSelect');

        expect(event_output).toEqual("event1 event2");
      });

    });

    describe('default filter', function(){

      beforeEach(function(){
        $("#autoCompleteField").smartAutoComplete({maxResults: 2});
      });

      it("returns the matching results when using an array as the source", function(){
        var event_output = null;

        $("#autoCompleteField").unbind('filterReady.smart_autocomplete');
        $("#autoCompleteField").bind('filterReady', function(ev, results){ event_output = results });

        $("#autoCompleteField").smartAutoComplete().filter('t', ['test', 'table', 'abc']);
        expect(event_output).toEqual(['test', 'table']);
      }); 

      it("won't return more than the max results", function(){
        var event_output = null;

        $("#autoCompleteField").unbind('filterReady.smart_autocomplete');
        $("#autoCompleteField").bind('filterReady', function(ev, results){ event_output = results });

        $("#autoCompleteField").smartAutoComplete().filter('t', ['test', 'table', 'tea', 'tree', 'abc']);
        expect(event_output).toEqual(['test', 'table']);
      });

      it("initates an ajax call when source is given as a string", function(){
        spyOn($, 'ajax')
        var event_output = null;

        $("#autoCompleteField").smartAutoComplete().filter('t', 'http://localhost/autocomplete' );
        expect($.ajax).toHaveBeenCalled();
      }); 

    });

    describe('default no match', function(){

      it("should append no results found banner to result container", function(){
        setFixtures("<input id='autoCompleteField'/><ul id='resultsContainer'></ul>");
        $("#autoCompleteField").smartAutoComplete({ resultsContainer: "#resultsContainer" });
        $("#autoCompleteField").smartAutoComplete().noMatch();

        expect($("#resultsContainer")).toHaveText('Sorry, No Results Found');

      });

    });

    describe('default show results', function(){

      it("should apply styles to container relative to field", function(){
        setFixtures("<input id='autoCompleteField'/><div id='resultsContainer' style='display:none'></div>");

        $("#autoCompleteField").smartAutoComplete({ resultsContainer: "#resultsContainer" });
        $("#autoCompleteField").smartAutoComplete().showResults();

        expect($("#resultsContainer").attr('style')).not.toBeEmpty();

      });

      it("should make result container visible", function(){
        setFixtures("<input id='autoCompleteField'/><div id='resultsContainer' style='display:none'></div>");
        $("#autoCompleteField").smartAutoComplete({ resultsContainer: "#resultsContainer" });
        $("#autoCompleteField").smartAutoComplete().showResults();

        expect($("#resultsContainer")).toBeVisible();

      });

    });

    describe('default hide results', function(){

      it("should make result container hidden", function(){
        setFixtures("<input id='autoCompleteField'/><div id='resultsContainer'></div>");
        $("#autoCompleteField").smartAutoComplete({ resultsContainer: "#resultsContainer" });
        $("#autoCompleteField").smartAutoComplete().hideResults();

        expect($("#resultsContainer")).not.toBeVisible();

      });

    });

    describe('default item select', function(){

      beforeEach(function(){
        setFixtures("<input id='autoCompleteField'/><div id='selectedField'>I was selected!</div>");
        $("#autoCompleteField").smartAutoComplete({});
      });
      
      it('should set the text of selected item as the value of field', function(){
        $("#autoCompleteField").smartAutoComplete().itemSelect($("#selectedField"));
        expect($("#autoCompleteField")).toHaveValue('I was selected!');
      });
    })

    //pending
    describe('user starts typing', function(){

      it("should wait till minimum number of characters typed") 

      it("should apply the delay") 

    });

});
