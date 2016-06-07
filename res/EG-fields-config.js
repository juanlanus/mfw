    // EG is the global object that holds "Edit Goals" data
    var EG = EG || {};

    // state of the eval in the workflow (overriden by a location query
    // like ...html?state=20
    EG.state = 20;

    EG.states = {
      20: 'user at period outset',
      30: 'supervisor at period outset',
      40: 'user after supervisor´s check',
      50: 'supervisor after period run',
      60: 'user after period run'
    };

    EG.fieldsConfig = [
      { selector:'.eg-goals-name div',    config: { 20:'editable', 30:'editable', 40:'locked', 50:'locked', 60:'locked' }},
      { selector:'.eg-goals-target div',  config: { 20:'editable', 30:'editable', 40:'locked', 50:'locked', 60:'locked' }},
      { selector:'.eg-goals-done div',    config: { 20:'hidden', 30:'hidden', 40:'hidden', 50:'editable', 60:'locked' }},
      { selector:'.eg-goals-percent div', config: { 20:'hidden', 30:'hidden', 40:'hidden', 50:'calculated', 60:'calculated' }},
      { selector:'.eg-goals-delete',      config: { 20:'active', 30:'active', 40:'active', 50:'hidden', 60:'hidden' }},
      { selector:'.eg-goals-percent div', config: { 20:'hidden', 30:'hidden', 40:'hidden', 50:'calculated', 60:'calculated' }},
      { selector:'.eg-goals-delete',      config: { 20:'active', 30:'active', 40:'active', 50:'hidden', 60:'hidden' }},
      { selector:'.ZZZ',                  config: { 20:'hidden', 30:'hidden', 40:'active', 50:'hidden', 60:'active' }},
      { selector:'.eg-comment',           config: { 20:'hidden', 30:'hidden', 40:'editable', 50:'locked', 60:'editable' }},
      { selector:'.eg-acknowledge',       config: { 20:'hidden', 30:'hidden', 40:'visible', 50:'locked', 60:'visible' }},
      { selector:'.eg-newGoalButton',     config: { 20:'active', 30:'active', 40:'active', 50:'hidden', 60:'hidden' }}

    ];


    // compute the relative percent of the done col over the target
    EG.computePercent = function ( $theRow ){
      var target = $.trim( $theRow.find( '.eg-goals-target' ).text() );
      target = parseInt( target, 10 );
      var done = $.trim( $theRow.find( '.eg-goals-done' ).text() );
      done = parseInt( done, 10 );
      var $percent = $theRow.find( '.eg-goals-percent' );
      if( target && done ) {
        $percent.text(( 100 * done / target ).toFixed(0) + '%' );
      } else {
        $percent.text( '' );
      }
    }

    EG.setEditable = function ( state ){
      // apply the current state's config to appropriate elements

      // loop over the rules, apply to elements according to class
      var n = EG.fieldsConfig.length;
      for( var i = 0; i < n; i++ ){
        var fc = EG.fieldsConfig[i];
        var theElements = $( '#editGoals ' + fc.selector );
        // reset config
        theElements.removeAttr( 'contenteditable' );
        theElements.removeAttr( 'tabindex' );
        theElements.css( 'visibility', '' );
        // apply selected configuration
        switch( fc.config[ state ] ){
        case 'locked':
          break;
        case 'editable':
          theElements.attr({ contenteditable:'true', tabindex:10 });
          break;
        case 'hidden':
          theElements.css( 'visibility', 'hidden' );
          break;
        case 'active':
          break;
        default:
          break;
        }
      };
      EG.computePercent( $(this) );
    // TODO: reassign all tabindex's to restore order
    }


    $(document).ready(function () {

      // get state from location query string, if present
      var state = window.location.search.replace(/\?state=(\d\d)/, '$1');
      if ( state ) {
        EG.state = state;
        $( '#stateSelector' ).val( state );
        $( '#eg-title' ).text( $( '#stateSelector option:selected' ).text() );
      }

      // prevent newlines in text input, sanitize pasted content
      // TODO: apply these handlers to newly added goal rows
      $('#editGoals div[contenteditable="true"]')
      .on(
        'keypress',
        function (e) {
          if( e.keyCode == 10 || e.keyCode == 13 ) {
            e.preventDefault();
          }
        }
      )
      .on(
        'paste keyup',
        function(){
          var _this = this;
          // remove the markups (replace HTML by its text)
          setTimeout( function(){ $(_this).html($(_this).text()); }, 20 );
        }
      );

      // filter input characters of numeric fields
      $( '#editGoals.eg-editGoals' ).on(
        'keypress paste input textinput',
        function( event ){
          // check that the event target is a good one (a contenteditable div
          // with one of the right classes) and depending on the class apply
          // the appropriate rules (numeric, length, ...)
          console.log( event.type + ' happened to ' + event.target.nodeName + ' '
            + event.originalEvent.currentTarget.classList + ': '
            + event.originalEvent.target.innerText);
        }
      );

      // configure editabillity according to state
      EG.setEditable( EG.state, EG.fieldsConfig );

      // reconfigure on state change
      $( '#stateSelector' ).on(
        'change',
        function( event ){
          EG.state = $("#stateSelector").val();
          $( '#eg-title' ).text( $( '#stateSelector option:selected' ).text() );
          EG.setEditable( EG.state, EG.fieldsConfig );
        }
      )

      // expand select element on focus
      $('.eg-goals-evaluation select').on(
        'focus',
        function(){
          $( this ).attr( 'size', '6' ); // TODO: compute the actual number of options
        }
      );

      // close select element on blur
      $('.eg-goals-evaluation select').on(
        'blur',
        function(){
          $( this ).attr( 'size', '0' );
        }
      );

      // activate the delete goal buttons
      $( '#editGoals .eg-goals ' ).on(
        'click',
        function( event ){
          $this = $( event.target );
          // if the click was in the delete button hide its row
          if( $this.closest( '.eg-goals-delete' ).length ) {
            // deleted rows are hidden, for now
            $this.closest( 'tr' ).css( 'display', 'none' );
          }
        }
      );

      // activate the add-new-goal actions
      $( '.eg-addOne' ).on(
        'click',
        function( event ){
          // reference the button
          var $this = $( event.target );
          // get the hidden model and make a detached clon of a row
          var newGoal = $this.closest( 'tfoot' ).find( '.eg-newGoal' ).clone();
          // get the last tr in the table
          var lastGoal = $this.closest( 'table' ).find( 'tbody' ).find( 'tr:last' );
          // insert the new goal and focus its first input field
          newGoal
            .removeClass( 'eg-newGoal' )
            .insertAfter( lastGoal )
            .css( 'display', '' )
            .find( 'div[contenteditable=true]' ).first().focus();
          EG.setEditable( EG.state, EG.fieldsConfig );
        });

      // recalculate goal-level percent when target or done values change
      $( '#editGoals .eg-goals-target > div, #editGoals .eg-goals-done > div' ).on(
        'keypress paste input textinput',
        function( event ){
          $theRow = $( event.target ).closest( 'tr' );
          if( $theRow ){
            // compute the relative percent of the done col over the target
            EG.computePercent( $theRow );
          }
        }
      );

      EG.goalChoices = {
        "Negocio": [
          "Colocaciones a plazo fijo (M$)",
          "Captacion de nuevos clientes corporativos",
          "Captacion de nuevos clientes personales"
        ],
        "Gestión Operacional": [
          "Tiempo de respuesta en créditos",
          "Tiempo de respuesta en renovaciones y ampliaciones"
        ],
        "Estrategia": [ ],
        "Gestión de Personas": [ ],
        "Riesgos": [ ]
      };

      EG.displayGoalChoices = function( $goalName ){
        console.log( $goalName.text() );
        // get the click target axis name
        // TODO: ensure there is an IE8 shim for String.trim()
        var axisName = $goalName.closest('table').closest('li').contents()[0].textContent.trim();
        var axisData = EG.goalChoices[ axisName ];
        console.log( 'editing goals of the "' + axisName + '" axis');
        if( ! axisData.length ) { return; }
        // build the select with the axis' goal choices
        // <div class="eg-goal-choices" style="display:block;">
        //   <select size="3">
        //     <option>Colocaciones a plazo fijo (M$)</option>
        //     <option>Captación de nuevos clientes corporativos</option>
        //     <option>Captación de nuevos clientes personales</option>
        //   </select>
        // </div>
        var $goalChoices = $( '#editGoals .eg-goal-choices select')
          .empty()
          .attr( 'size', axisData.length )
        ;
        for( var i = 0; i < axisData.length; i++ ){
          var newOptions = [];
          newOptions.push( $( '<option>' ).text( axisData[i] ) );
          $goalChoices.append( newOptions );
        };
        // resize & display the select control, positioned over the goal name input cell
        var coords = $goalName.offset();
        coords.w = $goalName.parent().width();
        coords.h = $goalName.parent().height();
        $goalChoices.width( coords.w );
        $goalName.css( 'position', 'relative' );
        $goalChoices.css({
          display: 'block',
          position: 'absolute',
          left: coords.left,
          top: coords.top + coords.h
        })
        .parent().css( 'display', 'block' )
        ;
        // bind the select to mouse and keyboard input events
        $goalChoices.off( 'click.ZZZ' );
        $goalChoices.on(
          'click.ZZZ',
          function( event ){
            if( event.type === 'click' ){
              console.log( 'clicked a goal name: ' + event.target.text );
              $goalName.text( event.target.text );
              $( event.target ).closest( 'select' ).css( 'display', 'none' );
            }
          }
        );
      };

      // activate the predefined goals descriptions list
      // TODO: must bind the event to the table in order to include newly added rows
      $( '#editGoals .eg-goals' ).on(
        'click',
        function( event ){
          // get a reference to the clicked element
          var $theTarget = $( event.target );
          // disregard if field is not a name div
          if( ! $theTarget.first().parent().hasClass( 'eg-goals-name' ) ) { return; }
          // check that the field is currently editable
          if( $theTarget[0].hasAttribute( 'contenteditable' ) && $theTarget.attr( 'contenteditable' ) ) { 
            // check that it was the left button
            if( ! event.which === 1 ) { return };
            // check coordinates
            var clickX = event.pageX - $theTarget.offset().left;
            // disregard if click doesn't happen on or near the arrow
            if( clickX < ( $theTarget.width() - 30 ) ) { return; }
            // show the options
            EG.displayGoalChoices( $theTarget );
          }
        }
      );

    });

    function insertNewGoalAbove( event ){
    }

