  // GE is the global object that holds "Edit Goals" data
  var GE = GE || {};

  GE.evalItems = { // definitions of evaluation items for this type of user
    42: {
      criteria: 42,  // different employee sets are evaluated with specific criteria
      description: "Performance of leaders and managers",
      1: { id:'1', type:'header', description:'First group of eval items' },
      2: { id:'2', type:'number', description:'Positive idiosyncrasy', topValue:'3000' },
      3: { id:'3', type:'p100',   description:'Anthropometric synergic attitude' },
      4: { id:'4', type:'binary', description:'Is a natural leadership junkie' },
      5: { id:'5', type:'header', description:'Second group of eval items' },
      6: { id:'6', type:'binary', description:'Has that success tendency', optional:true },
      7: { id:'7', type:'step',   description:'Advise acceptance', steps:['awful', 'low', 'regular', 'high', 'impressing'] },
      8: { id:'8', type:'spacer' }
    }
  };

  //================================================================================
  // Environment:
  //   GE.evalItems               eval items definitions, by criteria and id
  //   GE.userGroups              evaluee sets and their selection queries
  //   GE.evaluations             the evaluations data file, indexed by user id
  //   GE.currentUserEvals        last two evaluations for the current user
  //   GE.emptyEvaluation         generated empty evals, indexed by eval criteria
  //   GE.currentUser             selected evaluee file entry
  //   GE.getUserData(id)         return the user file entry with id == id
  //   GE.buildNewEvaluation(c)   build an empty evaluation with criteria c
  //   GE.getCurrentUserEvals(i)  load GE.currentUserEvals with an attitude
  //   GE.putCurrentUserEvals()   store GE.currentUserEvals in file TODO
  //   GE.getEvalItemValue(id)    get values for the current eval with id == id
  // * GE.evalItemsBuild($t,c)    build the evals UI for user displayed in $t
  //
  // * GE.setEvalItemHoverHandlers()
  //   GE.selectUsers( groupId, usersAlreadyListed )
  //   GE.setEvalValue( $evalItem, value, text )
  //   GE.getDisplayElement( $evalItem )
  //   GE.setDisplayText( $evalItem, displayText )
  //   GE.processKBInput( $e )
  //   GE.getItemDefs( $this )
  // * GE.calculatePointedValue( $this, hoverEvent )
  //   GE.handleNumEvalClick( $this, $e, event )
  // * GE.handleEvalClick( $e, event )
  // * GE.buildStepItemUI($t,d)   build quicksearch artifact for step-type eval
  //                              items and set kb evant handlers
  // * GE.setEvalItemKBHandler($t,d) set kb action handlers for all eval item types
  //   GE.resetEvalItemKBHandler( $eventTarget )
  //   GE.isDigit(x)              return true if x is a digit 
  //   GE.selectElementText(e)    select element's text on kb focus (automatic for <input>)
  //   GE.beep()                  make a brief complain sound
  //   $()                        set focus handlers
  //
  //================================================================================
  // Class for header-type eval items
  //
  //   #    #  ######    ##    #####   ######  #####
  //   #    #  #        #  #   #    #  #       #    #
  //   ######  #####   #    #  #    #  #####   #    #
  //   #    #  #       ######  #    #  #       #####
  //   #    #  #       #    #  #    #  #       #   #
  //   #    #  ######  #    #  #####   ######  #    #
  //
  // 1: { id:'1', type:'header', description:'First group of eval items' },
  // <div id="ge-e-item-1" class="ge-e-item ge-e-header">First group of eval items</div>
  GE.evalItemHeader = function( criteria, evalItemId ){
    this.element = undefined;  // ref to the associated DOM element
    this.criteria = criteria; 
    this.evalItemId = evalItemId;
    this.evalItem = GE.evalItems[ criteria ][ evalItemId ];
  };
  GE.evalItemHeader.prototype.setDOMElementReferences = function( $theItem ){
    this.$element = {}; // this item's internal elements
    this.$element.$item = $theItem;
  };
  GE.evalItemHeader.prototype.buildHTML = function( evalData ){
    if( ! this.template ){
      this.template = _.template( this.templateSource );
    };
    return this.template( evalData );
  };
  GE.evalItemHeader.prototype.templateSource = 
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-header"><%= u.def.description %></div>';

  //================================================================================
  // Class for number-type eval items
  //
  //   #    #  #    #  #    #  #####   ######  #####
  //   ##   #  #    #  ##  ##  #    #  #       #    #
  //   # #  #  #    #  # ## #  #####   #####   #    #
  //   #  # #  #    #  #    #  #    #  #       #####
  //   #   ##  #    #  #    #  #    #  #       #   #
  //   #    #   ####   #    #  #####   ######  #    #
  //
  // 2: { id:'2', type:'number', description:'Positive idiosyncrasy', topValue:'3000' },
  /*
    <div id="ge-e-item-3" class="ge-e-item ge-e-p100">
      <div class="ge-e-value">
        <div class="ge-e-value-A" style="width: 78.8235%;">&nbsp;</div>
      </div>
      <div class="ge-e-name" style="opacity: 1;">Anthropometric synergic attitude</div>
      <input type="text" class="ge-e-display" tabindex="0" value="">
    </div>
  */
  GE.evalItemNumber = function( criteria, evalItemId ){
    this.element = undefined;  // ref to the associated DOM element
    this.criteria = criteria; 
    this.evalItemId = evalItemId;
    this.evalItem = GE.evalItems[ criteria ][ evalItemId ];
  };
  GE.evalItemNumber.prototype.setDOMElementReferences = function( $theItem ){
    this.$element = {}; // this item's internal elements
    this.$element.$item = $theItem;
    this.$element.$value = $theItem.find( '.ge-e-value' );
    this.$element.$display = $theItem.find( '.ge-e-display' );
    this.$element.$name = $theItem.find( '.ge-e-name' );
  };
  // text content of the $display element
  GE.evalItemNumber.prototype.text = function(){
    return this.hasValue ? this.evalItem.steps[ this.value ] : '';
  };
  // value pointed to by mouse during hover
  GE.evalItemNumber.calculatePointedValue = function( hoverEvent ){
    value = $( hoverEvent.target ).closest( 'td' ).index() + 1;
    text = hoverEvent.target.textContent;
  };
  GE.evalItemNumber.prototype.handleHover = function( hoverEvent ){
    switch( hoverEvent.type ){
      case 'mouseenter':
        this.isHoveringAValue = true;
        this.hoverStartValue = this.value;
        this.$element.$display.addClass( 'ge-e-display-hovered' );
        var $A = this.$element.$item.find( '.ge-e-value-A' );
        var leftEdgePosition = $A.offset().left;
        var valPx = hoverEvent.pageX - leftEdgePosition;
        value = Math.round( valPx * this.evalItem.topValue / $A.parent().width());
        text = '' + value;
        break;
      case 'mousemove':
        if( this.isHoveringAValue ){
          GE.calculatePointedValue( this.$element.$item, hoverEvent );
        }
        break;
      case 'mouseleave':
        this.isHoveringAValue = false;
        this.hoverStartValue = null;
        this.$element.$display.removeClass( 'ge-e-display-hovered' );
        if( this.isHoveringAValue ){ // if user didn't click then restore initial value
          this.$element.$display.val( GE.hoverStartValue );
        };
        this.isHoveringAValue = false;
        this.hoverStartValue = '';
        break;
      default:
        break;
    }
  };



  GE.evalItemNumber.prototype.buildHTML = function( evalData ){
    if( ! this.template ){
      this.template = _.template( this.templateSource );
    };
    return this.template( evalData );
  };
  GE.evalItemNumber.prototype.templateSource = 
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-number">' +
    '  <div class="ge-e-value">' +
    '    <div class="ge-e-value-A" style="width:<%= u.v.width %>%;">&nbsp;</div>' +
    '  </div>' +
    '  <div class="ge-e-name<%= u.def.optional ? " ge-e-name-optional":"" %>"><%= u.def.description %></div>' +
    '  <input type="text" class="ge-e-display" tabindex="0" title="out of <%= u.def.topValue %>" value=<%= u.v.text %>>' +
    '</div>';

  //================================================================================
  // Class for step-type eval items
  //
  //    ####    #####  ######  #####
  //   #          #    #       #    #
  //    ####      #    #####   #    #
  //        #     #    #       #####
  //   #    #     #    #       #
  //    ####      #    ######  #
  //
  // 7: { id:'7', type:'step',   description:'Advise acceptance', steps:['awful', 'low', 'regular', 'high', 'impressing'] },
  GE.evalItemStep = function( criteria, evalItemId ){
    this.element = undefined;  // ref to the associate DOM element
    this.criteria = criteria; 
    this.evalItemId = evalItemId;
    this.evalItem = GE.evalItems[ criteria ][ evalItemId ];
    this.hasValue = undefined;
    this.value = undefined;
  };
  GE.evalItemStep.prototype.setDOMElementReferences = function( $theItem ){
    this.$element = {}; // this item's internal elements
    this.$element.$item = $theItem;
    this.$element.$value = $theItem.find( '.ge-e-value' );
    this.$element.$display = $theItem.find( '.ge-e-display' );
    this.$element.$name = $theItem.find( '.ge-e-name' );
  };
  // text content of the $display element
  GE.evalItemStep.prototype.text = function(){
    return this.hasValue ? this.evalItem.steps[ this.value ] : '';
  };
  // value (step) pointed to by mouse during hover
  GE.evalItemStep.calculatePointedValue = function( hoverEvent ){
    value = $( hoverEvent.target ).closest( 'td' ).index() + 1;
    text = hoverEvent.target.textContent;
  };
  GE.evalItemStep.prototype.handleHover = function( hoverEvent ){
    var $this = $( event.target );
    var $theItem = $this.closest( '.ge-e-item' ); // has a class per item type
    var $theDisplay = GE.getDisplayElement( $theItem );
    switch( hoverEvent.type ){
      case 'mouseenter':
        this.isHoveringAValue = true;
        this.hoverStartValue = this.value;
        this.$element.$item.addClass( 'ge-e-display-hovered' );
        GE.calculatePointedValue( $theItem, hoverEvent );
        this.$element.$name.stop().animate( { opacity:0.30 }, 700 );
        break;
      case 'mousemove':
        if( GE.isHoveringAValue ){
          GE.calculatePointedValue( $theItem, hoverEvent );
        }
        break;
      case 'mouseleave':
        $this.closest( '.ge-evaluations').find( '.ge-e-display-hovered' ).removeClass( 'ge-e-display-hovered' );
        if( GE.isHoveringAValue ){ // if user didn't click then restore initial value
          $theDisplay.val( GE.hoverStartValue );
        };
        GE.isHoveringAValue = false;
        GE.hoverStartValue = '';
        $this.closest( '.ge-e-item' ).find( '.ge-e-name' ).stop().animate( { opacity:1.00 }, 300 );
        break;
      default:
        break;
    }
  };
  GE.evalItemStep.prototype.buildHTML = function( evalData ){
    if( ! this.template ){
      this.template = _.template( this.templateSource );
    };
    // TODO: SPS? (3)
    var evalData = { def:this.evalItem, value:0, text:'' };
    evalData.v = GE.getEvalItemValue( this.evalItemId ); // { value:..., text:..., hasValue:... }
    // TODO: activate GE.evalsHTML.push( this.template( evalData ) );
    return this.template( evalData );
  };
  GE.evalItemStep.prototype.templateSource = 
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-step">' +
    '  <div class="ge-e-value">' +
    '    <table><tbody>' +
    '      <tr><% _.each( u.def.steps, function( evalItem, i, itemsList ){ %>' +
    '' +    '<td class="ge-e-one-step ge-e-one-step-<%= (i >= u.v.value)? "off":"on" %>" style="width:<%= 100 / u.def.steps.length %>%"><%= u.def.steps[i] %></td>' +
    '      <% } ) %></tr>' +
    '    </tbody></table>' +
    '  </div>' +
    '  <div class="ge-e-name<%= u.def.optional ? " ge-e-name-optional":"" %>">Advise acceptance</div>' +
    '  <input type="text" id="ge-e-stepInput" class="ge-e-display" tabindex="0" value="<%= u.v.text %>">' +
    '  <ul id="ge-e-stepInputChoices" class="ge-e-stepChoices" style="display:none;">' +
    '    <% _.each( u.def.steps, function( stepName, i, steps ){ %><li tabindex="0"><%= ( i + 1 ) + " " + stepName %></li><% }); %>' +
    '  </ul>' +
    '</div>';

  //================================================================================
  GE.template = {};

  GE.template.evalItemHeader =
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-header"><%= u.def.description %></div>';

  GE.template.evalItemNumber =
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-number">' +
    '  <div class="ge-e-value">' +
    '    <div class="ge-e-value-A" style="width:<%= u.v.width %>%;">&nbsp;</div>' +
    '  </div>' +
    '  <div class="ge-e-name<%= u.def.optional ? " ge-e-name-optional":"" %>"><%= u.def.description %></div>' +
    '  <input type="text" class="ge-e-display" tabindex="0" title="out of <%= u.def.topValue %>" value=<%= u.v.text %>>' +
    '</div>';

  GE.template.evalItemP100 =
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-p100">' +
    '  <div class="ge-e-value">' +
    '    <div class="ge-e-value-A" style="width:<%= u.v.width %>%;">&nbsp;</div>' +
    '  </div>' +
    '  <div class="ge-e-name<%= u.def.optional ? " ge-e-name-optional":"" %>"><%= u.def.description %></div>' +
    '  <input type="text" class="ge-e-display" tabindex="0" value=<%= u.v.text %>>' +
    '</div>';

  GE.template.evalItemBinary =
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-binary">' +
    '  <div class="ge-e-value">' +
    '    <div class="ge-e-binary-<%= (u.v.value ? "yes" : "no") %>">&nbsp;</div>' +
    '  </div>' +
    '  <div class="ge-e-name<%= u.def.optional ? " ge-e-name-optional":"" %>"><%= u.def.description %></div>' +
    '  <input type="text" class="ge-e-display" tabindex="0" value=<%= u.v.text %>>' +
    '</div>';

  GE.template.evalItemSpacer =
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-spacer">&nbsp;</div>';

  GE.userGroups = [ {
    groupName: "team",
    groupDescription: "G2G / StarMeUp",
    groupId:"StarMeUp" // includes users having "project":"StarMeUp",
  }, {
    groupName: "others",
    groupDescription: "others",
    groupId:"*" // includes all users not previously listed (must be last)
  } ];

  // evaluations file
  GE.evaluations = { // keyed by user id, last two evals for each user
    5: { // only one, complete
      userId:5,
      evals: [
        {
          dateCreated:'2015-04-21T18:25:43.511Z',
          dateLastModified:'2015-04-28T18:25:43.511Z',
          criteria: 42,
          isComplete:true,
          2: { id:'2', value:1527 },
          3: { id:'3', value:42 },
          4: { id:'4', value:true },
          6: { id:'6', value:false },
          7: { id:'7', value:3 }
        }
      ]
    },
    94: { // one incomplete, one complete
      userId:5,
      evals: [
        {
          dateCreated:'2015-05-21T18:25:43.511Z',
          dateLastModified:'2015-05-28T18:25:43.511Z',
          criteria: 42,
          isComplete:false,
          2: { id:'2', value:2000 },
          3: { id:'3' },
          4: { id:'4' },
          6: { id:'6' },
          7: { id:'7', value:3 }
        },
        {
          dateCreated:'2015-04-21T18:25:43.511Z',
          dateLastModified:'2015-04-28T18:25:43.511Z',
          criteria: 42,
          isComplete:true,
          2: { id:'2', value:1527 },
          3: { id:'3', value:42 },
          4: { id:'4', value:true },
          6: { id:'6', value:false },
          7: { id:'7', value:3 }
        }
      ]
    } // , ... more users
  };

  // current evaluee last two evaluations (1st is new or incomplete)
  GE.currentUserEvals = [];

  GE.emptyEvaluation = { // created dynamically with GE.evalItems
    // indexed by evaluation criteria
    42: {
      dateCreated:null,
      dateLastModified:null,
      criteria: 42,
      isComplete:false,
      2: { id:'2' },
      3: { id:'3' },
      4: { id:'4' },
      6: { id:'6' },
      7: { id:'7' }
    }
  };

  GE.currentUser = null; // selected user's file entry

  GE.getUserData = function( currentUserId ){
    return _.find( GE.users, function( user ){ return user.id == currentUserId; } );
  };

  GE.buildNewEvaluation = function( evaluationCriteria ){
    if( ! GE.emptyEvaluation[ evaluationCriteria ] ){
      var ne = {};
      _.each(
        GE.evalItems[ evaluationCriteria ],
        function( evalItemDef, i, evalItemDefs ){
          ne[ evalItemDef.id ] = { id:evalItemDef.id };
        }
      )
      GE.emptyEvaluation[ evaluationCriteria ] = ne;
      }
    var newEval = $.extend( {}, GE.emptyEvaluation[ evaluationCriteria ] );
    newEval.criteria = evaluationCriteria;
    newEval.dateCreated = new Date();
    newEval.dateLastModified = newEval.dateCreated;
    newEval.isComplete = false;
    return newEval;
  };

  GE.getCurrentUserEvals = function( theUserId ){
    // return an array of 2 evals:
    // first one is an incomplete existing one else a new empty one
    // second one is the newest complete one or missing
    // only the 1st one will be modified, the 2nd one is for reference
    // TODO: read data from localStorage
    var z = _.find(
      GE.evaluations,
      function( ue ){ return ue.userId == theUserId; }
    );
    var e = [];
    if( z ){ // the user has evaluation(s)
      e[0] = z.evals[0];
    } else { // user not in evals file
      e[0] = $.extend( {}, GE.emptyEvaluation[ GE.currentUser.evaluationCriteria ] );
      GE.evaluations[ theUserId ] = { // add to file
        theUserId: {
          userId: theUserId,
          evals: [ e ] 
        }
      };
    };
    if( e[0].isComplete ){
      // prepend a new empty eval[0]
      var newEval = GE.buildNewEvaluation( GE.currentUser.evaluationCriteria );
      newEval.dateCreated = new Date();
      newEval.dateLastModified = new Date();
      newEval.criteria = 42;
      e.unshift( newEval );
    } else {
      // the existing eval[0] is the first one
    };
    return e;
  };

  GE.putCurrentUserEvals = function( ){
    // TODO: write th current user's evaluations to localStorage
  };

  GE.getEvalItemValue = function( evalItemDefId ){
    // returns { value:..., text:..., hasValue:y/n }
    var v = { value:0, text:'', hasValue:false };
    var ue0 = GE.currentUserEvals[0];       // current, edited, new or incomplete
    var ue1 = GE.currentUserEvals[1] || {}; // complete or missing
    if( ue0[ evalItemDefId ] && ue0[ evalItemDefId ].hasOwnProperty( 'value' ) ){
      v.hasValue = true;
      v.value = ue0.value;
      v.text = v.value.toString();
    } else if( ue1 && ue1.criteria === ue0.criteria && ue1[ evalItemDefId ] && ue1[ evalItemDefId ].hasOwnProperty( 'value' ) ){
      v.hasValue = false;
      v.value = ue1[ evalItemDefId ].value;
      v.text = '';
    } else { /* nothing */ };
    return v;
  };

  GE.evalItemsBuild = function( $clickTarget, evaluationCriteria ){
    // build the eval items set UI for the clicked user
    GE.currentUserEvals = GE.getCurrentUserEvals( GE.currentUser.id, GE.currentUser.evaluationCriteria );
    // two congruent arrays: one for the HTML elements and the other for 
    // the corresponding eval item objects
    var evalsHTML = [];
    var evalsObjects = [];
    // the eval items UI elements
    var $UIElements = $( '<div/>' );
    GE.evalsHTML = [];
    _.each(
      GE.evalItems[ evaluationCriteria ],
      function( evalItemDef, i, evalItemDefs ){
        // combine eval defs and data in the object to be passed to templates
        var evalData = { def:evalItemDef, value:0, text:'' };
        evalData.v = GE.getEvalItemValue( evalItemDef.id ); // { value:..., text:..., hasValue:... }
        switch( evalItemDef.type ){
        case 'header':
          // 1: { id:'1', type:'header', description:'First group of eval items' },
          // TODO: if the evaluation is complete display a big checkmark floated at right
          var headerObject = new GE.evalItemHeader( evaluationCriteria, evalItemDef.id );
          var $theItem = $( headerObject.buildHTML( evalData ) );
          $UIElements.append( $theItem ); 
          headerObject.setDOMElementReferences( $theItem );

          var templateForHeader = _.template( GE.template.evalItemHeader );
          evalsHTML.push( templateForHeader( evalData ) );
          evalsObjects.push( headerObject );
          break;
        case 'number':
          // 2: { id:'2', type:'number', description:'Positive idiosyncrasy', topValue:'3000' },
          var numberObject = new GE.evalItemNumber( evaluationCriteria, evalItemDef.id );
          evalData.v.width = Math.round( evalData.v.value / evalData.def.topValue * 10000 ) / 100;
          var $theItem = $( numberObject.buildHTML( evalData ) );
          $UIElements.append( $theItem ); 
          numberObject.setDOMElementReferences( $theItem );

          var templateForNumber = _.template( GE.template.evalItemNumber );
          evalsHTML.push( templateForNumber( evalData ) );
          evalsObjects.push( numberObject );
          break;
        case 'p100':
          // 3: { id:'3', type:'p100',   description:'Anthropometric synergic attitude' },
          evalData.v.width = evalData.v.value;
          var templateForP100 = _.template( GE.template.evalItemP100 );
          evalsHTML.push( templateForP100( evalData ) );
          evalsObjects.push( {} );
          break;
        case 'binary':
          // 6: { id:'6', type:'binary', description:'Has that success tendency' },
          if( evalData.v.hasValue ){
            evalData.v.text = evalData.v.value ? '\u274C' : '\u2713'; // ✓ &#x274c; ❌ &#x2713;
          } else {
            evalData.v.text = '';
          };
          var templateForBinary = _.template( GE.template.evalItemBinary );
          evalsHTML.push( templateForBinary( evalData ) );
          evalsObjects.push( {} );
          break;
        case 'step':
          // 7: { id:'7', type:'step',   description:'Advise acceptance', steps:['awful', 'low', 'regular', 'high', 'impressing'] },
          var stepObject = new GE.evalItemStep( evaluationCriteria, evalItemDef.id );
          var $theItem = $( stepObject.buildHTML( evalData ) );
          $UIElements.append( $theItem ); 
          stepObject.setDOMElementReferences( $theItem );
           evalsHTML.push( stepObject.buildHTML( evalData ) ); // TODO: replace
           evalsObjects.push( stepObject );
          break;
        case 'spacer':
          // 8: { id:'8', type:'spacer' }CX    
          var templateForSpacer = _.template( GE.template.evalItemSpacer );
          evalsHTML.push( templateForSpacer( evalData ) );
          evalsObjects.push( {} );
          break;
        default:
          break;
        };
      }
    );
    // render the eval item UI, add the eval items set to the DOM
    var $HTMLTarget = $( '#ge-evaluations-' + GE.currentUser.id );
    $HTMLTarget.html( evalsHTML.join( '' ) );
    var evalItemElems = $HTMLTarget.find( '.ge-e-item' );
    // attach the eval item objects to their eval item HTML elements
    _.each(
      evalItemElems,
      function( evalItemElem, i, evalItemElems ){
        evalsObjects[i].element = evalItemElem;
        $( evalItemElem ).data( evalsObjects[i] );
      }
    )
    // attach the eval objects array to the evaluee item
    $clickTarget.closest( '.ge-oneUser' ).data( 'evalObjects', evalsObjects );

    GE.setEvalItemHoverHandlers();
  };




  GE.setEvalItemHoverHandlers = function(){
    // when hovering the value bar, show the value associated with the pointer's position
    // TODO: doesn't work with generated HTML, set to container and drill down
    $( '.ge-e-value' ).on(
      'mouseenter.eihh mousemove.eihh mouseleave.eihh',
      function( event ){
        var $this = $( event.target );
        var $theItem = $this.closest( '.ge-e-item' ); // has a class per item type
        var $theDisplay = GE.getDisplayElement( $theItem );
        if( $theItem.hasClass( 'ge-e-step' ) && event.target.nodeName !== 'TD' ){ 
          event.stopPropagation;
          return false;
        };
        // for eval items with object, the objetc's handleHover method does the work
        var eio = $theItem.data(); // eval item object
        if( eio.handleHover ){
          eio.handleHover( event );
          return;
        }
        switch( event.type ){
          case 'mouseenter':
            GE.isHoveringAValue = true;
            GE.hoverStartValue = $theDisplay.val();            // TODO: for step items saves all the step names?
            $theDisplay.addClass( 'ge-e-display-hovered' );
            GE.calculatePointedValue( $theItem, event );
            $this.closest( '.ge-e-item' ).find( '.ge-e-name' ).stop().animate( { opacity:0.30 }, 700 );
            break;
          case 'mousemove':
            if( GE.isHoveringAValue ){
              GE.calculatePointedValue( $theItem, event );
            }
            break;
          case 'mouseleave':
            $this.closest( '.ge-evaluations').find( '.ge-e-display-hovered' ).removeClass( 'ge-e-display-hovered' );
            if( GE.isHoveringAValue ){ // if user didn't click then restore initial value
              $theDisplay.val( GE.hoverStartValue );
            };
            GE.isHoveringAValue = false;
            GE.hoverStartValue = '';
            $this.closest( '.ge-e-item' ).find( '.ge-e-name' ).stop().animate( { opacity:1.00 }, 300 );
            break;
          default:
            break;
        }
      }
    );
  };

  GE.selectUsers = function( groupId, usersAlreadyListed ){
    var thisGroup = [];
    _.each(
      GE.users,
      function( thisUser, i, allUsers ){
        if( groupId === '*' ){
          if( ! usersAlreadyListed[ i ] ){
            thisGroup.push( thisUser);
          }
        } else {
          if( thisUser.project === groupId ){
            thisGroup.push( thisUser);
            usersAlreadyListed[ i ] = true;
          }
        }
      }
    );
    return thisGroup;
  };

  GE.setEvalValue = function( $evalItem, value, text ){
  // saves the evaluation value in the display element's data
    var theId = $evalItem.closest( '.ge-e-item' )[0].id.replace( 'ge-e-item-', '' ); // 123 of ge-e-item-123
    $evalItem.data( 'eval', { id:theId, value:value, text:text } );
    console.log( 'stored for id:' + theId + ' value:' + value + ' text:' + text );
  };

  GE.getDisplayElement = function( $evalItem ){
  // given an element of an evaluation item, return a reference to its display
    return $evalItem.closest( '.ge-e-item' ).find( '.ge-e-display' );
  };

  GE.setDisplayText = function( $evalItem, displayText ){
  // given an element of an evaluation item, set its display text
    var $display = GE.getDisplayElement( $evalItem );
    $display.val( displayText );
  };

  GE.processKBInput = function( $e ){
    console.log( 'handling KB input:' + $e.target.textContent.trim() );
  };

  GE.getItemDefs = function( $this ){
  // return the eval item type, or null if not an evaluatable item
    var $item = $this.closest( '.ge-e-item' );
    if( ! $item.length ){ return null; } // arg was not an eval item
    if( $item.hasClass( 'ge-e-spaces ge-e-header' ) ){ return null; }
    var theId = $item[0].id.replace( 'ge-e-item-', '' ); // 123 of ge-e-item-123
    // TODO: the evaluationCriteria thing is wrong: it must be the evaluation's, not the evaluee's
    var theEvalItem = GE.evalItems[ GE.currentUser.evaluationCriteria ][ theId ]; 
    return theEvalItem;
  };

  GE.calculatePointedValue = function( $this, hoverEvent ){
  // returns value and text correponding to the current pointer position 
  // on a hovered item thus  { value:foo, text:'bar' }
    var itemDefs = GE.getItemDefs( $this );
    var value, text;
    switch( itemDefs.type ){
      case 'number':
      case 'p100':
        var $A = $this.find( '.ge-e-value-A' );
        var leftEdgePosition = $A.offset().left;
        var valPx = hoverEvent.pageX - leftEdgePosition;
        value = Math.round( valPx * ( itemDefs.type === 'p100' ? 100 : itemDefs.topValue ) / $A.parent().width());
        text = '' + value + ( itemDefs.type === 'p100' ? '%' : '' );
        break;
      case 'binary':
        value = ( $this.find( '.ge-e-binary-yes' ).length > 0 );
        if( value ){ text = '\u274C' } else { text = '\u2713'; };
        break;
      case 'step':
        value = $( hoverEvent.target ).closest( 'td' ).index(); // zero based
        text = hoverEvent.target.textContent;
        break;
      default:
        break;
    }
    GE.setDisplayText( $this, text );                       // TODO: this does not belong here, or does it?
    return { id:itemDefs.id, value:value, text:text };
  };

  GE.handleNumEvalClick = function( $this, $e, event ){
    // handle click on number and percent type items
    var itemDefs = GE.getItemDefs( $this );
    var topValue = itemDefs.topValue;
    var $evalItem = $e.closest( '.ge-e-item' );
    var $A = $this.find( '.ge-e-value-A' );
    var leftEdgePosition = $A.offset().left;
    if( $e.hasClass( 'ge-e-display' )){ // click on display area:
      // make display editable for a number value
      if( ! $e.attr( 'contenteditable' )){ return; }
      $e.attr( 'contenteditable' , true );
      // wait for input
      $e.one(
        'blur',
        function( $this ){ GE.processKBInput( $this ); }
        // TODO: check input validity, display new value, compute valPx, display graphinc value
      );
    } else { // click on graphic display bar:
      // compute valPx proportional to value and resize bar
      var valPx = event.pageX - leftEdgePosition;
      $A.animate( { width: ( valPx / $A.parent().width() * 100 ) + '%' } );
      // compute value proportional to pointer position
      var value = Math.round( valPx * ( itemDefs.type === 'p100' ? 100 : itemDefs.topValue ) / $A.parent().width());
    }
    var text = '' + value + ( itemDefs.type === 'p100' ? '%' : '' );
    GE.setEvalValue( $this, value, text );
    GE.setDisplayText( $this, text );
  };

  GE.handleEvalClick = function( $e, event ){
    GE.isHoveringAValue = false;
    GE.getDisplayElement( $e ).removeClass( 'ge-e-display-hovered' );
    var $this = $e.closest( '.ge-e-item' );
    console.log( 'handling evaluation item input for ' + $this.attr( 'class' ) );
    var evalItemTypeClass = $this.attr('class').split(' ')[1]; // the 2nd class name
    var isKBInput = $e.hasClass( 'ge-e-display' ); // click was on display area
    var value, text;
    switch( evalItemTypeClass ){
      case 'ge-e-header':
        return;
      case 'ge-e-number':
        var itemDefs = GE.getItemDefs( $this );
        GE.handleNumEvalClick( $this, $e, event, 'number', itemDefs.topValue );
        return;
      case 'ge-e-p100':
        GE.handleNumEvalClick( $this, $e, event, 'p100' );
        return;
      case 'ge-e-binary':
        var $z = $this.find( '.ge-e-binary-yes' );                          // !!!!!!!!!!!!!!!!!!!!!!! HARDCODED
        if( $z.length ){
          $z.removeClass( 'ge-e-binary-yes' ).addClass( 'ge-e-binary-no' );
          text = '\u274C'; // ❌
        } else {
          var $z = $this.find( '.ge-e-binary-no' );
          $z.removeClass( 'ge-e-binary-no' ).addClass( 'ge-e-binary-yes' );
          text = '\u2713'; // ✓
        }
        GE.setEvalValue( $this, value, text );
        GE.setDisplayText( $this, text ); // ❌
        return;
      case 'ge-e-step':
      // handle click on enumerated type items
        var $display = GE.getDisplayElement( $this );
        if( $e.hasClass( 'ge-e-display' )){ // click on display area:
          // build and open a drop-down for the user to choose
        } else { // click on a value cell
          value = $( event.target ).closest( 'td' ).index() + 1; // 1-based
          text = event.target.textContent;
          $this.find( '.ge-e-one-step' ).removeClass( 'ge-e-one-step-on  ge-e-one-step-off' ).addClass( 'ge-e-one-step-on' );
          $( event.target ).nextAll().removeClass( 'ge-e-one-step-on' ).addClass( 'ge-e-one-step-off' );
        }
        GE.setEvalValue( $this, value, text );
        GE.setDisplayText( $this, text );
        $display.text( text );
        return;
      case 'ge-e-spacer':
        return;
      default:
        return;
    }
  };

  GE.buildStepItemUI = function( $eventTarget, evalItemDef ){
    // show choices selector and enable step type eval item quicksearch
    $( '#ge-e-stepInputChoices' ).show( 400 );
    var qs = $('#ge-e-stepInput').quicksearch(
      '#ge-e-stepInputChoices li',
      {
        removeDiacritics: true,
        show: function () { $(this).removeClass('hiddenByQS'); },
        hide: function () { $(this).addClass('hiddenByQS'); },
      }
    );
    // capture kb input on step input choices
    $( '#ge-e-stepInputChoices li' ).on(
      'keypress.kbStep',
      function( event ){
        var $this = $( this );
        var $theDisplayElement = $this.closest( '.ge-e-item' ).find( '.ge-e-display' );
        var stepName = $this.text();
        stepName = stepName.substring( stepName.indexOf( ' ' ) + 1 ); // trim number
        switch( event.which ){
          case 32: // space: select current value
            console.log( 'spacebar in ' + $this.text() );
            event.preventDefault();
            $theDisplayElement.val( stepName );
            break;
          case 13: // enter: select current value and go forward
            console.log( 'enter in ' + $this.text() );
            event.preventDefault();
            $theDisplayElement.val( stepName );
            $this.parent().hide( 100 );
            break;
        };
      }
    );
/* step-type eval item example:
<div id="ge-e-item-7" class="ge-e-item ge-e-step">                   2: get a ref to this
  <div class="ge-e-value">                        
    <table><tbody>
      <tr>
        <td class="ge-e-one-step ge-e-one-step-on" style="width:20%">awful</td>
        <td class="ge-e-one-step ge-e-one-step-on" style="width:20%">low</td>
        <td class="ge-e-one-step ge-e-one-step-on" style="width:20%">regular</td>
        <td class="ge-e-one-step ge-e-one-step-off" style="width:20%">high</td>
        <td class="ge-e-one-step ge-e-one-step-off" style="width:20%">impressing</td>
      </tr>
    </tbody></table>
  </div>
  <div class="ge-e-name">Advise acceptance</div>
  <input type="text" class="ge-e-display" tabindex="0" value="">     3: get a ref to this and set its text
  <ul id="ge-e-stepInputChoices" class="ge-e-stepChoices">           
    <li tabindex="0">0 awful</li>                                    1: kb action here
    <li tabindex="0">1 low</li>
    <li tabindex="0">2 regular</li>
    <li tabindex="0">3 high</li>
    <li tabindex="0">4 impressing</li>
  </ul>
</div>
$(this).trigger({
    type: 'keypress',
    which: 9
});
    up = 38
    down = 40
    left = 37
    right = 39
*/
    // move up and down within the steps list with the arrows
    $( '#ge-e-stepInputChoices li' ).on(
      'keydown.kbStep',
      function( event ){
        var $this = $( this );
        switch( event.which ){
          case 38: // keyup: move to previous
            console.log( 'keyup in ' + $this.text() );
            event.preventDefault();
            event.stopPropagation();
            event.which = 0;
            var $prev = $this.prev();
            if( $prev.length ){ $prev.focus() };
          break;
          case 40: // keydown: move to next
            console.log( 'keydown in ' + $this.text() );
            event.preventDefault();
            event.stopPropagation();
            event.which = 0;
            var $next = $this.next();
            if( $next.length ){ $next.focus() };
          break;
        };
      }
    );

  };

  GE.setEvalItemKBHandler = function( $eventTarget, evalItemDef ){
    // the display of an eval item has focus and gets KB input
    $eventTarget.off( 'keypress' );

    // if( ! GE.mouseIsDown){ // if focus given by keyboard action
    //   GE.selectElementText( $eventTarget[0] ); // select current text
    // };

    // build input UI for enumerated eval items
    if( evalItemDef.type === 'step' ){
      GE.buildStepItemUI( $eventTarget, evalItemDef );
    };

    $eventTarget.on(
      'keypress',
      evalItemDef,
      function( event ){
        var char = String.fromCharCode( event.which );
        var keyCode = event.which;
        switch ( evalItemDef.type ){
        case 'number':
          if( ! GE.isDigit( char ) ){ event.preventDefault(); }
          break;
        case 'p100':
          if( ! GE.isDigit( char ) ){ event.preventDefault(); }
          break;
        case 'binary': // '\u2713' : '\u274C'; // ❌ &#x274c; ✓ &#x2713; 
          switch( event.which ){
          case 32: // spacebar: if checked then uncheck else check
            // console.log( 'spacebar in binary eval item containing "' + $eventTarget.text().trim() + '"' );
            $eventTarget.val( ( $eventTarget.val().trim() === '\u2713' ) ? '\u274c' : '\u2713' ); // ✓ &#x2713; ❌ &#x274c; 
            break;
          case 49:  // 1: set on
          case 38:  // up arrow: set on
          case 43: // +: set on
          case 121: // y: set on
          case 89: // Y: set on
          case 115: // s: set on
          case 83: // S: set on
            $eventTarget.val( '\u2713' );
            break;
          case 48:  // 0: set off
          case 40:  // down arrow: set off
          case 45: // -: set off
          case 110: // n: set off
          case 78: // N: set off
            $eventTarget.val( '\u274c' );
            break;
          }
          event.preventDefault();
          break;
        default: // eval item type
          break;
        };
        event.stopPropagation();
      }
    )
  };

  GE.resetEvalItemKBHandler = function( $eventTarget ){
    // turn off this element's KB events handler
  };


  $(document).ready( function (){
    // _.each(list, iteratee, [context]) Alias: forEach 
    // Each invocation of iteratee is called with three arguments: (element, index, list).
    // If list is a JavaScript object, iteratee's arguments will be (value, key, list).

    // build users list
    // console.log( 'GE.users: ' + GE.users.length );  // JSON.stringify( GE.users, null, 2 ) );
    GE.usersAlreadyListed = []; // no users listed
    var templateSource = _.template( $( 'script#ge-template-users' ).html() ).source; // precompilation?
    var templateForUsers = _.template( $( 'script#ge-template-users' ).html() );
    var HTMLForUsers = templateForUsers( GE.userGroups );
    $( '#ge-evalueeGroups' ).html( HTMLForUsers );
    // add empty padding at the bottom of the users list to ensure scroll to top
    $( '#ge-padding' ).height( window.height);

    // attach hardcoded evaluations context #hardCodedEvaluationsInputContext to a single user
    var $attachTarget = $( "#ge-evaluations-5" );
    var $attachSource = $( "#ge-evaluations-5-hardCoded" );
    $attachTarget.html( $attachSource.html() );

    // handle click event on a user data or on evaluations
    $( '#ge-evalueeGroups .ge-users-group' ).on(
      'mouseup',
      function( event ){
        if( ! event.which === 1 ) { return; } // not the primary button
        $clickTarget = $( event.target );
        var $LIContainer = $clickTarget.closest( 'li' );
        // get user's data
        var currentUserId = $LIContainer[0].id.split('-')[2]; // "5" of "ge-user-5"
        GE.currentUser = GE.getUserData( currentUserId );
        // check if eval items UI is already rendered
        var $userEvals = $LIContainer.find('.ge-evaluations');
        if( ! $userEvals.hasClass( 'ge-loaded' ) ){
          $( '.ge-e-value' ).off( ".eihh" ); // remove prior event handlers
          // TODO: write previous evals, if any and modified   create a GE.evalsAreModified boolean flag
          // TODO: get last 2 evaluations data (for now use the hardcoded data)
          GE.evalItemsBuild( $clickTarget, GE.currentUser.evaluationCriteria );
          $userEvals.addClass( 'ge-loaded' );
        };
        // ensure that eval items UI is the only visible one
        if( ! $userEvals.is(':visible') ){
          $( '.ge-loaded' ).not( $userEvals ).removeClass( 'ge-loaded' ).hide();
          $userEvals.slideDown( 400 );
          // TODO: NOT NEEDED ANY MORE: GE.evalItemsResize( $clickTarget, event );
        };
        // ensure the user data is at the top of the screen
        var itemOffset =  $LIContainer.offset();
        if( $(window).scrollTop() != itemOffset.top ){
          $('html, body').animate( { scrollTop: itemOffset.top, scrollLeft: itemOffset.left }, 400 );
        };
        // exit if click was on user header, else handle eval item interaction
        if( ! $clickTarget.closest( '.ge-evaluations' ).length ){
        } else {
          GE.handleEvalClick( $clickTarget, event );
        };
        event.stopPropagation();
        return false;
        var theEvalsId =  '#ge-evaluations-' + GE.currentUser.id;
      }
    );

    // enable evaluees quicksearch
    var qs = $('#userFilter').quicksearch(
      '#ge-evalueeGroups .ge-oneUser',
      {
        removeDiacritics: true,
        delay: 200,
        show: function () {
          $(this).removeClass('hiddenByQS');
        },
        hide: function () {
          $(this).addClass('hiddenByQS');
        },
      }
    );

    $('#userFilter').focus(); // set initial focus to search box

    // main focus handler
    $( '.ge-evalueesGroup' ).on(
      'focus',
      '.ge-oneUser',
      function( event ){
        var $eventTarget = $( event.target );
        // focus on evaluee header
        if( $eventTarget.hasClass( 'ge-oneUser' ) ){
          $eventTarget.click(); // user: display eval items UI
          console.log( '\nfocus on an evaluee ' + $( event.target ).find( '.ge-user-name' ).text().trim() );
          event.stopPropagation();
        } else { // eval item display: allow edition
          var $evalItem = $eventTarget.closest( '.ge-e-item' );
          console.log( 'focus on eval item ' + $evalItem.find( '.ge-e-name' ).text() );
          event.stopPropagation();
          var evalItemDef = GE.getItemDefs( $evalItem );
          GE.setEvalItemKBHandler( $eventTarget, evalItemDef );
          $eventTarget.one(
            'blur',
            evalItemDef,
            function( event ){
              $theValue = $( event.target );
              $theItem = $eventTarget.closest( '.ge-e-item' ); // DEBUG?
              console.log( '  exit from edited field ' + $theItem.find( '.ge-e-name' ).text()
              + ' ' +  $(this).attr('class') + ' ' + $theValue.val() + ' type:' + evalItemDef.type );
              GE.resetEvalItemKBHandler( $theValue );
              $theValue.removeClass( 'ge-e-value-error' );
              switch ( evalItemDef.type ){
              case 'number':
                if( parseInt( $theValue.val(), 10 ) > evalItemDef.topValue ){
                  $theValue.addClass( 'ge-e-value-error' );
                  GE.beep();
                  event.preventDefault();
                }
                break;
              case 'p100':
                if( parseInt( $theValue.val(), 10 ) > 100 ){
                  $theValue.addClass( 'ge-e-value-error' );
                  GE.beep();
                  event.preventDefault();
                }
                break;
              default:
                break;
              };
            }
          );
        };
      }
    );


    // activate click to edit an evaluation item value
    $( '#ge-evaluations-5 .ge-e-item' ).one(
      'click',
      function( event ){
        $clickTarget = $( event.delegateTarget );
        console.log( 'clicked: ' + $clickTarget.attr( 'class' ) + ' ' + $( event.target ).text().trim() );
      }
    );

    $( '.ge-e-one-step' ).on(
      'mouseenter mousemove mouseleave',
      function( event ){
        $( event.target ).closest( '.ge-e-value' ).trigger( event.type );
      }
    );

    GE.mouseIsDown = false;

    GE.isDigit = (function(){
      // return true if the single char argument is a decimal digit
      var matchSingleDigit = /^\d$/;
      return function( char ) {
        return matchSingleDigit.test( char );
      }
    }());

    GE.selectElementText = function( el ){
      var r, s;
      if( window.getSelection ){
        s = window.getSelection();
        r = document.createRange();
        r.selectNodeContents( el );
        s.removeAllRanges();
        s.addRange( r );
      } else {
        r = document.body.createTextRange();
        r.moveToElementText( el );
        r.select();
      }
    };

    GE.beep = function() {
      var beepSound = new Audio('data:audio/wav;base64,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' +
          'iiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIa' +
          'CrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg' +
          '+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb///' +
          '////////////////////////////////////////////////////////////////////////////////////////' +
          '////////////////////////////////////////////////////////////////////////////////////////' +
          '////////////////////////////////////////////////////////////////////////////////////////' +
          '////////////////////////////////////////////////////////////////////////////////////////' +
          '//////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAA' +
          'AAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
          'AAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
      // These lines are suspected to raise an error in ff:
      // cancel any ongoing beep just before shooting a new one
      // if( ! beepSound.paused ){
      //   beepSound.pause();
      //   beepSound.currentTime = 0;
      // }
      beepSound.play();
    };

  });
