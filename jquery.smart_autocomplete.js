/**
 * Smart Auto Complete plugin 
 * 
 * Copyright (c) 2011 Lakshan Perera (laktek.com)
 * Licensed under the MIT (MIT-LICENSE.txt)  licenses.
 * 
*/

/*
 $(target).smartAutoComplete({options})
  options:
  minCharLimit: (integer) minimum characters user have to type before invoking the autocomplete (default: 2)
  maxResults: (integer) maximum number of results to return (default: -1 (unlimited)) - works only with the default filter
  delay: (integer) delay before autocomplete starts (default: 300ms)
  typeAhead: (boolean) fill the field with the best matching result, as in google instant search (default: false)
             and fires the select event.
  disabled: (boolean) whether autocomplete disabled on the field (default: false)
  forceSelect: (boolean) always fills the field with best matching result, without leaving custom input (similar to a select field) (default false)
  source:  (array/function) you can supply an array or callback function that would return an array for the source
           this is optional if you prefer to have your own filter method 
           eg: ["Apple", "Banana", "Mango"] or [["Apple", 1], ["Banana", 2], ["Mango", 3]]
           or [["Apple", 1, {picture: 'apple.jpg'}], ["Banana", 2, {picture: 'banana.jpg'}], ["Mango", 3, {picture: 'mango.jpg'}]]
  filter: (function) define a function on that would return matching items to the query (use this if you want to override the default filtering algorithm)
          expects to return an array 
          arguments: query, list
  resultFormatter: (function) the function you supply here will be called to format the output of the individual result.
                   expects to return a string
                   arguments: result 
  resultsContainer: (selector) to which elements the result should be appended.

  events:
  keyIn: fires when user types into the field
  filterReady: fires when the filter function returns
  showResults: fires when results are shown 
  hideResults: fires when results are hidden
  noMatch: fires when filter returns an empty array to append to the view
  itemSelect: fires when user selects an item from the result list
 })
*/

(function($){
  $.fn.smartAutoComplete = function(){    

    if(arguments.length < 1){
      // get the smart autocomplete object of the first element and return 
      var first_element = this[0];
      return $(first_element).data("smart-autocomplete")
    }

    var default_filter_matcher = function(term, source, context){
                                    var matcher = new RegExp(term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i" );

                                    return $.grep(source, function(value) {
                                      return matcher.test( value );
                                    });

                                 }

    var default_options = {
                            minCharLimit: 2, 
                            maxResults: -1,
                            delay: 300,
                            typeAhead: false,
                            disabled: false,
                            forceSelect: false,

                            resultFormatter: function(r){ return ("<li>" + r + "</li>"); },

                            filter: function(term, source){    
                              var context = this.context;
                              var max_results = this.maxResults;
                              //when source is an array
                              if($.type(source) === "array") {
                                // directly map
                                var results = default_filter_matcher(term, source, context);
                                $(context).trigger('filterReady', [results.splice(0, max_results)]);
                              }
                              //when source is a string
                              else if($.type(source) === "string"){
                                // treat the string as a URL endpoint
                                // pass the query as 'term'

                                $.ajax({
                                  url: source,
                                  data: {"term": term},
                                  dataType: "json",
                                  success: function( data, status, xhr ) {
                                    $(context).trigger('filterReady', [data.splice(0, max_results)]);
                                  },
                                  error: function( xhr ) {
                                  }
                                });
                                
                              }

                            },

                            showResults: function(){    
                              var context = $(this.context);
                              var results_container = $(this.resultsContainer);

                              //show the results container after aligning it with the field 
                              if(results_container){}
                                results_container.css({ 
                                      position: "absolute",
                                      top: function(){ return context.position().top + context.height(); }, 
                                      left: function(){ return context.position().left; }, 
                                      width: function(){ return context.width(); } 
                                }).show();
                            },

                            hideResults: function(){    
                              //show the results container if it's hidden (or append it after the field if it was created on the fly)
                              if($(this.resultsContainer))
                                $(this.resultsContainer).hide();
                            },

                            noMatch: function(){    
                              var result_container = $(this.resultsContainer);
                              if(result_container){
                               //clear previous results
                               this.clearResults(); 

                               result_container.append("<li class='_smart_autocomplete_no_result'>Sorry, No Results Found</li>");
                              }

                            },

                            itemSelect: function(selected_item){    
                              //get the context
                              var context = this.context;
                              //get the text from selected item
                              var selected_value = $(selected_item).text();
                              //set it as the value of the autocomplete field
                              $(context).val(selected_value); 
                            },

                            clearResults: function(){
                              $(this.resultsContainer).html("");
                            }



    };

    
    var passed_options = arguments[0];

    return this.each(function(i) { 
      //set the options
      var options = $.extend(default_options, $(this).data("smart-autocomplete"), passed_options);
      options['context'] = this;

      //if a result container is not defined
      if(!options.resultsContainer){

        //define the default result container if it is already not defined
        if($("._smart_autocomplete_container").length < 1){
          var default_container = $("<ul class='_smart_autocomplete_container' style='display:none'></ul>");
          default_container.appendTo("body");
        }
        else
          var default_container = $("._smart_autocomplete_container");

        options.resultsContainer = default_container;
      }

      // save the values in data object
      $(this).data("smart-autocomplete", options);

      //bind the events
      $(this).keyup(function(ev){
        $(this).trigger('keyIn', [$(this).val()]); 
      });

      $(this).bind('keyIn.smart_autocomplete', function(ev, query){
        var smart_autocomplete_field = this;
        var options = $(smart_autocomplete_field).data("smart-autocomplete");
        var source = options.source || null;
        var filter = options.filter;

        if(options.disabled)
          return false;

        //call the filter function
        filter.apply(this, [query, options.source]);

      });

      $(this).bind('filterReady.smart_autocomplete', function(ev, results){
        var smart_autocomplete_field = this;
        var options = $(smart_autocomplete_field).data("smart-autocomplete");
        var result_formatter = options.resultFormatter;
        var result_container = options.resultsContainer;

        //exit if smart complete is disabled
        if(options.disabled)
          return false;

        //fire the no match event and exit if no matching results
        if(results.length < 1){
          $(smart_autocomplete_field).trigger('noMatch');
          return false
        }

        //call the results formatter function
        var formatted_results = $.map(results, function(result){
          var formatted_element = result_formatter.apply(smart_autocomplete_field, [result]);

          //add class to identify as autocomplete result item
          $(formatted_element).addClass('smart_autocomplete_result');

          return formatted_element
        });

        var formatted_results_html = formatted_results.join("");

        //clear all previous results 
        $(smart_autocomplete_field).smartAutoComplete().clearResults();

        //append the results to the container
        $(result_container).append(formatted_results_html);

        //bind an event to trigger item selection
        $(result_container).delegate('smart_autocomplete_result', 'click', function(){
          $(smart_autocomplete_field).trigger('itemSelect', this);
        });

        //trigger results ready event
        $(smart_autocomplete_field).trigger('showResults', [result_container, results]);

      });

      $(this).bind('showResults.smart_autocomplete', function(ev, result_container, raw_results){

        var smart_autocomplete_field = this;

        //run the default event if no custom handler is defined
        if($(smart_autocomplete_field).data('events')['showResults'].length > 1)
          return;

        $(smart_autocomplete_field).smartAutoComplete().showResults(result_container, raw_results);
      });

      $(this).bind('hideResults.smart_autocomplete', function(ev){

        var smart_autocomplete_field = this;

        //run the default event if no custom handler is defined
        if($(smart_autocomplete_field).data('events')['hideResults'].length > 1)
          return;

        $(smart_autocomplete_field).smartAutoComplete().hideResults();
      });

      $(this).bind('noMatch.smart_autocomplete', function(ev){

        var smart_autocomplete_field = this;

        //run the default event if no custom handler is defined
        if($(smart_autocomplete_field).data('events')['noMatch'].length > 1)
          return;

        $(smart_autocomplete_field).smartAutoComplete().noMatch();
      });

      $(this).bind('itemSelect.smart_autocomplete', function(ev, selected_item){

        var smart_autocomplete_field = this;

        //run the default event if no custom handler is defined
        if($(smart_autocomplete_field).data('events')['itemSelect'].length > 1)
          return;

        $(smart_autocomplete_field).smartAutoComplete().itemSelect(selected_item);
      });

    });
  }

})(jQuery);

