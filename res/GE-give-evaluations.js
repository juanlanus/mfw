  // GE is the global object that holds the "Edit Goals" moving parts
  var GE = GE || {};

  //================================================================================
  // Class for evaluees
  //
  //   ######  #    #    ##    #       #    #  ######  ######
  //   #       #    #   #  #   #       #    #  #       #
  //   #####   #    #  #    #  #       #    #  #####   #####
  //   #       #    #  ######  #       #    #  #       #
  //   #        #  #   #    #  #       #    #  #       #
  //   ######    ##    #    #  ######   ####   ######  ######
  //
  // There are "users" and "evaluees". 
  // Users are all those who are registered in the database. 
  // Evaluees is the subset of those users the current user (the current evaluator)
  // can evaluate or whose evaluations she's allowed to see: her team, her friends,
  // those below in the pecking order, whatever, depending on the company policies. 
  // The users are registered in the users file GE.users. 
  // The evaluees of an evaluator are organized in "groups" like the team, etc. 
  // Each group is selected by a custon query that hits the database and collects
  // a number of users. There might be any number of groups associated with the
  // current evaluator. 
  // The system keeps track of those evaluees not included in any previous group 
  // and can render them as a group perhaps named something like "All others". 
  // 
  // For the purpose of this prototype the users file is a JSON and there are two
  // groups, the "StarMeUp" team group and all the other users.
  //
  // There is some intercahgeability in the naming of users and evaluees in the
  // code, but for the purpose of this, they all are evaluees. 

  GE.evaluees = {}; // the evaluees map {id:..., data:{} }

  GE.Evaluee = function( id, data ){
    this.id = id;
    this.data = data;
  };

  // build an evaluee's UI using its data and the template
  // TODO: this builds all the groups, as the template loops over the list
  GE.Evaluee.prototype.render = function(){
    if( ! this.prototype.template ){
      this.prototype.template = _.template( this.templateSource );
    };
    return this.prototype.template( user );
  };

  GE.Evaluee.prototype.templateSource =
      '      <li class="ge-oneUser" id="<%= \'ge-user-\' + user.id %>" tabindex="0">' +
      '        <div class="ge-user-picture" style="background-image:url(res/<%= user.profileImageCode %>.jpg);"></div>' +
      '        <div class="ge-user-data">' +
      '          <p class="ge-user-name"><%= user.firstName + \' \' + user.lastName %>' +
      '          <% if( user.nickname && false ) {%><span class="ge-nickname" title="nickname"><%= user.nickname %></span><% } %></p>' +
      '          <div class="ge-user-fields">' +
      '            <p> <span class="ge-field-value"><%= user.seniority %></span>' +
      '            <% if( user.area ){%><span class="ge-field-name">area:</span><span class="ge-field-value"><%= user.area.trim() %></span><% } %>' +
      '            <% if( user.project ){%><span class="ge-field-name">project:</span><span class="ge-field-value"><%= user.project.trim() %></span></p><% } %>' +
      '            <span style="display:inherit; font-size:0;"><%= user.searchCriteria %></span>' +
      '          </div>' +
      '        </div>' +
      '        <div id="ge-evaluations-<%= user.id %>" class="ge-evaluations"> <!-- insert evals here --> </div>' +
      '      </li> <% }); %>';

  GE.Evaluee.prototype.templateZZZ =
      '<% var makeEvalueesGroup = function( group, igroup ) { %>' +
      '<% var users = GE.selectUsers( group.groupId, GE.usersAlreadyListed ); %>' +
      '  <div class="ge-evalueesGroup" id="ge-evaluees-<%= group.groupName %>">' +
      '    <p id="ge-title-<%= group.groupName %>" class="ge-title"><%= group.groupDescription %></p>' +
      '    <ul class="ge-users-group">' +
      '      <% _.each( users, function( user, key, list ){ %>' +
      '      <li class="ge-oneUser" id="<%= \'ge-user-\' + user.id %>" tabindex="0">' +
      '        <div class="ge-user-picture" style="background-image:url(res/<%= user.profileImageCode %>.jpg);"></div>' +
      '        <div class="ge-user-data">' +
      '          <p class="ge-user-name"><%= user.firstName + \' \' + user.lastName %>' +
      '          <% if( user.nickname && false ) {%><span class="ge-nickname" title="nickname"><%= user.nickname %></span><% } %></p>' +
      '          <div class="ge-user-fields">' +
      '            <p> <span class="ge-field-value"><%= user.seniority %></span>' +
      '            <% if( user.area ){%><span class="ge-field-name">area:</span><span class="ge-field-value"><%= user.area.trim() %></span><% } %>' +
      '            <% if( user.project ){%><span class="ge-field-name">project:</span><span class="ge-field-value"><%= user.project.trim() %></span></p><% } %>' +
      '            <span style="display:inherit; font-size:0;"><%= user.searchCriteria %></span>' +
      '          </div>' +
      '        </div>' +
      '        <div id="ge-evaluations-<%= user.id %>" class="ge-evaluations"> <!-- insert evals here --> </div>' +
      '      </li> <% }); %>' +
      '    </ul>' +
      '  </div> <% } %>' +

      '<% _.each(' +
      '  u,' +
      '  function( group, igroup, groupsList ){' +
      '    makeEvalueesGroup ( group, igroup );' +
      '  }' +
      '); %>';

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
  GE.EvalItemHeader = function( criteria, evalItemId ){
    this.element = undefined;  // ref to the associated DOM element
    this.criteria = criteria; 
    this.evalItemId = evalItemId;
    this.evalItem = GE.evalItems[ criteria ][ evalItemId ];
  };
  GE.EvalItemHeader.prototype.setDOMElementReferences = function( $theItem ){
    this.$element = {}; // this item's internal elements
    this.$element.$item = $theItem;
  };
  // click on the value bar to set a new value
  GE.EvalItemHeader.prototype.handleClick = function( clickEvent ){
  };
  GE.EvalItemHeader.prototype.buildHTML = function( evalData ){
    if( ! this.template ){
      this.template = _.template( this.templateSource );
    };
    return this.template( evalData );
  };
  GE.EvalItemHeader.prototype.templateSource = 
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
  GE.EvalItemNumber = function( criteria, evalItemId, value ){
    this.element = undefined;  // ref to the associated DOM element
    this.criteria = criteria; 
    this.evalItemId = evalItemId;
    this.evalItem = GE.evalItems[ criteria ][ evalItemId ];
    this.eval = {}; // evaluation values
    this.eval = $.extend( this.eval, value || {} )
  };
  GE.EvalItemNumber.prototype.setDOMElementReferences = function( $theItem ){
    this.$element = {}; // this item's internal elements
    this.$element.$item = $theItem;
    this.element = $theItem[0];
    this.$element.$value = $theItem.find( '.ge-e-value' );
    this.$element.$display = $theItem.find( '.ge-e-display' );
    this.$element.$name = $theItem.find( '.ge-e-name' );
  };
  // text content of the $display element
  GE.EvalItemNumber.prototype.text = function(){
    return this.hasValue ? this.evalItem.steps[ this.value ] : '';
  };
  GE.EvalItemNumber.prototype.showText = function( text ){
    this.$element.$display.val( text ); 
  };
  // value pointed to by mouse during hover
  GE.EvalItemNumber.prototype.calculateValue = function( hoverEvent ){
    var $A = this.$element.$item.find( '.ge-e-value-A' );
    var valPx = hoverEvent.pageX - $A.offset().left;
    return Math.round( valPx * this.evalItem.topValue / $A.parent().width() );
  };
  GE.EvalItemNumber.prototype.handleHover = function( hoverEvent ){
    switch( hoverEvent.type ){
      case 'mouseenter':
        this.isHoveringAValue = true;
        this.hoverStartText = this.$element.$display.val();
        this.$element.$display.addClass( 'ge-e-display-hovered' );
        this.showText( '' + this.calculateValue( hoverEvent ) );
        break;
      case 'mousemove':
        if( this.isHoveringAValue ){
          this.showText( '' + this.calculateValue( hoverEvent ) );
        }
        break;
      case 'mouseleave':
        if( this.isHoveringAValue ){ // if user didn't click then restore initial value
          this.$element.$display.val( this.hoverStartText );
        };
        this.isHoveringAValue = false;
        this.hoverStartText = null;
        this.$element.$display.removeClass( 'ge-e-display-hovered' );
        break;
    }
  };
  GE.EvalItemNumber.prototype.handleBlur = function( blurEvent ){
    this.$element.$display.removeClass( 'ge-e-value-error' );
    if( parseInt( this.$element.$display.val(), 10 ) > this.evalItem.topValue ){
      this.$element.$display.addClass( 'ge-e-value-error' );
      GE.beep();
      blurEvent.preventDefault();
    }
  };

  // click on the value bar to set a new value
  GE.EvalItemNumber.prototype.handleClick = function( clickEvent ){
    var $A = this.$element.$item.find( '.ge-e-value-A' );
    // compute valPx proportional to value and resize bar
    var valPx = clickEvent.pageX - $A.offset().left;
    $A.animate( { width: ( valPx / $A.parent().width() * 100 ) + '%' } );
    // compute value proportional to pointer position
    this.eval.value = Math.round( valPx * this.evalItem.topValue / $A.parent().width() );
    this.eval.text = '' + this.eval.value;
    this.showText( this.eval.text );
  };

  // handle keyboard input
  GE.EvalItemNumber.prototype.handleKeydown = function( keyEvent ){
    if( ! GE.isDigit( String.fromCharCode( keyEvent.which ) ) ){ keyEvent.preventDefault(); }
  };

  GE.EvalItemNumber.prototype.buildHTML = function( evalData ){
    if( ! this.template ){
      this.template = _.template( this.templateSource );
    };
    return this.template( evalData );
  };
  GE.EvalItemNumber.prototype.templateSource = 
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-number">' +
    '  <div class="ge-e-value">' +
    '    <div class="ge-e-value-A" style="width:<%= u.v.width %>%;">&nbsp;</div>' +
    '  </div>' +
    '  <div class="ge-e-name<%= u.def.optional ? " ge-e-name-optional":"" %>"><%= u.def.description %></div>' +
    '  <input type="text" class="ge-e-display" tabindex="0" title="out of <%= u.def.topValue %>" value=<%= u.v.text %>>' +
    '</div>';

  //================================================================================
  // Class for p100-type eval items
  // 
  //             #      ###     ###
  //   #####    ##     #   #   #   #
  //   #    #  # #    # #   # # #   #
  //   #    #    #    #  #  # #  #  #
  //   #####     #    #   # # #   # #
  //   #         #     #   #   #   #
  //   #       #####    ###     ###
  // 
  // 3: { id:'3', type:'p100',   description:'Anthropometric synergic attitude' },
  GE.EvalItemP100 = function( criteria, evalItemId, value ){
    this.element = undefined;  // ref to the associated DOM element
    this.criteria = criteria; 
    this.evalItemId = evalItemId;
    this.evalItem = GE.evalItems[ criteria ][ evalItemId ];
    this.eval = {}; // evaluation values
    this.eval = $.extend( this.eval, value || {} )
  };
  GE.EvalItemP100.prototype.setDOMElementReferences = function( $theItem ){
    this.$element = {}; // this item's internal elements
    this.$element.$item = $theItem;
    this.$element.$value = $theItem.find( '.ge-e-value' );
    this.$element.$display = $theItem.find( '.ge-e-display' );
    this.$element.$name = $theItem.find( '.ge-e-name' );
  };
  // text content of the $display element
  GE.EvalItemP100.prototype.text = function(){
    return this.hasValue ? this.value + '%' : '';
  };
  GE.EvalItemP100.prototype.showText = function( text ){
    this.$element.$display.val( text ); 
  };
  // value pointed to by mouse during hover
  GE.EvalItemP100.prototype.calculateValue = function( hoverEvent ){
    var $A = this.$element.$item.find( '.ge-e-value-A' );
    var valPx = hoverEvent.pageX - $A.offset().left;
    return Math.round( valPx * 100 / this.$element.$value.width());
  };
  GE.EvalItemP100.prototype.handleHover = function( hoverEvent ){
    switch( hoverEvent.type ){
      case 'mouseenter':
        this.isHoveringAValue = true;
        this.hoverStartText = this.$element.$display.val();
        this.$element.$display.addClass( 'ge-e-display-hovered' );
        this.showText( '' + this.calculateValue( hoverEvent ) + '%' );
        break;
      case 'mousemove':
        if( this.isHoveringAValue ){
          this.showText( '' + this.calculateValue( hoverEvent ) + '%' );
        }
        break;
      case 'mouseleave':
        if( this.isHoveringAValue ){ // if user didn't click then restore initial value
          this.$element.$display.val( this.hoverStartText );
        };
        this.isHoveringAValue = false;
        this.hoverStartText = null;
        this.$element.$display.removeClass( 'ge-e-display-hovered' );
        break;
    }
  };
  GE.EvalItemP100.prototype.handleBlur = function( blurEvent ){
    this.$element.$display.removeClass( 'ge-e-value-error' );
    if( parseInt( this.$element.$display.val(), 10 ) > 100 ){
      this.$element.$display.addClass( 'ge-e-value-error' );
      GE.beep();
      event.preventDefault();
    }
  };

  // click on the value bar to set a new value
  GE.EvalItemP100.prototype.handleClick = function( clickEvent ){
    var $A = this.$element.$item.find( '.ge-e-value-A' );
    // compute valPx proportional to value and resize bar
    var valPx = clickEvent.pageX - $A.offset().left;
    $A.animate( { width: ( valPx / $A.parent().width() * 100 ) + '%' } );
    // compute value proportional to pointer position
    this.eval.value = Math.round( valPx * 100 / $A.parent().width() );
    this.eval.text = '' + this.eval.value + '%';
    this.showText( this.eval.text );
  };

  // handle keyboard input
  GE.EvalItemP100.prototype.handleKeydown = function( keyEvent ){
    if( ! GE.isDigit( String.fromCharCode( keyEvent.which ) ) ){ keyEvent.preventDefault(); }
  };

  GE.EvalItemP100.prototype.buildHTML = function( evalData ){
    if( ! this.template ){
      this.template = _.template( this.templateSource );
    };
    return this.template( evalData );
  };
  GE.EvalItemP100.prototype.templateSource = 
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-p100">' +
    '  <div class="ge-e-value">' +
    '    <div class="ge-e-value-A" style="width:<%= u.v.width %>%;">&nbsp;</div>' +
    '  </div>' +
    '  <div class="ge-e-name<%= u.def.optional ? " ge-e-name-optional":"" %>"><%= u.def.description %></div>' +
    '  <input type="text" class="ge-e-display" tabindex="0" value=<%= u.v.text %>>' +
    '</div>';

  //================================================================================
  // Class for binary-type eval items
  // 
  //   #####      #    #    #    ##    #####    #   #
  //   #    #     #    ##   #   #  #   #    #    # #
  //   #####      #    # #  #  #    #  #    #     #
  //   #    #     #    #  # #  ######  #####      #
  //   #    #     #    #   ##  #    #  #   #      #
  //   #####      #    #    #  #    #  #    #     #
  // 
  // 4: { id:'4', type:'binary', description:'Is a natural leadership junkie' },
  GE.EvalItemBinary = function( criteria, evalItemId, value ){
    this.element = undefined;  // ref to the associated DOM element
    this.criteria = criteria; 
    this.evalItemId = evalItemId;
    this.evalItem = GE.evalItems[ criteria ][ evalItemId ];
    this.eval = {}; // evaluation values
    this.eval = $.extend( this.eval, value || {} )
  };
  GE.EvalItemBinary.prototype.setDOMElementReferences = function( $theItem ){
    this.$element = {}; // this item's internal elements
    this.$element.$item = $theItem;
    this.$element.$value = $theItem.find( '.ge-e-value' );
    this.$element.$display = $theItem.find( '.ge-e-display' );
    this.$element.$name = $theItem.find( '.ge-e-name' );
  };

  // text content of the $display element
  GE.EvalItemBinary.prototype.text = function(){
    if( this.hasValue ){
      return( this.value ? '\u274C' : '\u2713' ); // ✓ &#x274c; ❌ &#x2713 );
    } else {
      return '';
    }
  };
  GE.EvalItemBinary.prototype.showText = function( text ){
    this.$element.$display.val( text ); 
  };
  // value to be set on click, during hover
  GE.EvalItemBinary.calculatePointedValue = function( hoverEvent ){
    if( this.value ){ return '\u274C' } else { return '\u2713'; };
  };
  GE.EvalItemBinary.prototype.handleHover = function( hoverEvent ){
    switch( hoverEvent.type ){
      case 'mouseenter':
        this.isHoveringAValue = true;
        this.hoverStartText = this.$element.$display.val();
        this.$element.$display.addClass( 'ge-e-display-hovered' );
        break;
      case 'mousemove':
        if( this.isHoveringAValue ){
          this.showText( GE.EvalItemBinary.calculatePointedValue( this.$element.$item, hoverEvent ) );
        }
        break;
      case 'mouseleave':
        this.$element.$display.removeClass( 'ge-e-display-hovered' );
        if( this.isHoveringAValue ){ // if user didn't click then restore initial value
          this.showText( this.hoverStartText );
          this.isHoveringAValue = false;
        };
        this.hoverStartText = '';
        break;
    }
  };
  GE.EvalItemBinary.prototype.handleBlur = function( blurEvent ){
  };

  // click on the value bar to set a new value
  GE.EvalItemBinary.prototype.handleClick = function( clickEvent ){
    var $z = this.$element.$value.find( 'div' );
    if( $z.hasClass( 'ge-e-binary-yes' ) ){ // value is true
      this.eval.value = false; // so set to false
      $z.removeClass( 'ge-e-binary-yes' ).addClass( 'ge-e-binary-no' );
      this.eval.text = '\u274C'; // ❌
    } else {
      this.eval.value = true;
      $z.removeClass( 'ge-e-binary-no' ).addClass( 'ge-e-binary-yes' );
      this.eval.text = '\u2713'; // ✓
    }
    this.showText( this.eval.text );
  };

  // handle keyboard input
  GE.EvalItemBinary.prototype.handleKeydown = function( keyEvent ){
    var $eventTarget = $( keyEvent.target );
    switch( keyEvent.which ){
    case 32: // spacebar: if checked then uncheck else check
      // console.log( 'spacebar in binary eval item containing "' + $eventTarget.text().trim() + '"' );
      $eventTarget.val( ( $eventTarget.val().trim() === '\u2713' ) ? '\u274c' : '\u2713' ); // ✓ &#x2713; ❌ &#x274c; 
      break;
    case 49:  // 1: set on
    case 38:  // up arrow: set on
    case 43:  // +: set on
    case 121: // y: set on
    case 89:  // Y: set on
    case 115: // s: set on
    case 83:  // S: set on
      $eventTarget.val( '\u2713' );
      break;
    case 48:  // 0: set off
    case 40:  // down arrow: set off
    case 45:  // -: set off
    case 110: // n: set off
    case 78:  // N: set off
      $eventTarget.val( '\u274c' );
      break;
    }
    keyEvent.preventDefault();
  };

  GE.EvalItemBinary.prototype.buildHTML = function( evalData ){
    if( ! this.template ){
      this.template = _.template( this.templateSource );
    };
    return this.template( evalData );
  };
  GE.EvalItemBinary.prototype.templateSource = 
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-binary">' +
    '  <div class="ge-e-value">' +
    '    <div class="ge-e-binary-<%= (u.v.value ? "yes" : "no") %>">&nbsp;</div>' +
    '  </div>' +
    '  <div class="ge-e-name<%= u.def.optional ? " ge-e-name-optional":"" %>"><%= u.def.description %></div>' +
    '  <input type="text" class="ge-e-display" tabindex="0" value=<%= u.v.text %>>' +
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
  GE.EvalItemStep = function( criteria, evalItemId, value ){
    this.element = undefined;  // ref to the associate DOM element
    this.criteria = criteria; 
    this.evalItemId = evalItemId;
    this.evalItem = GE.evalItems[ criteria ][ evalItemId ];
    this.hasValue = undefined;
    this.value = undefined;
    this.eval = {}; // evaluation values
    this.eval = $.extend( this.eval, value || {} )
  };
  GE.EvalItemStep.prototype.setDOMElementReferences = function( $theItem ){
    this.$element = {}; // this item's internal elements
    this.$element.$item = $theItem;
    this.$element.$value = $theItem.find( '.ge-e-value' );
    this.$element.$display = $theItem.find( '.ge-e-display' );
    this.$element.$name = $theItem.find( '.ge-e-name' );
  };
  // text content of the $display element
  GE.EvalItemStep.prototype.text = function(){
    return this.hasValue ? this.evalItem.steps[ this.value ] : '';
  };
  GE.EvalItemStep.prototype.showText = function( text ){
    this.$element.$display.val( text ); 
  };
  // value (step) pointed to by mouse during hover
  GE.EvalItemStep.calculatePointedValue = function( hoverEvent ){
    value = $( hoverEvent.target ).closest( 'td' ).index() + 1;
    text = hoverEvent.target.textContent;
  };

  GE.EvalItemStep.prototype.handleHover = function( hoverEvent ){
    if( hoverEvent.target.tagName !== 'TD' ) {
      hoverEvent.stopPropagation();
    }
    switch( hoverEvent.type ){
    case 'mouseenter':
      this.isHoveringAValue = true;
      this.hoverStartText = this.$element.$display.val();
      this.$element.$name.stop().animate( { opacity:0.30 }, 700 );
      this.$element.$display.addClass( 'ge-e-display-hovered' );
      this.showText( $( hoverEvent.target ).text() );
      GE.EvalItemStep.calculatePointedValue( hoverEvent );
      break;
    case 'mousemove':
      if( this.isHoveringAValue ){
        this.showText( $( hoverEvent.target ).text() );
      }
      break;
    case 'mouseleave':
      if( this.isHoveringAValue ){ // if user didn't click then restore initial value
        this.$element.$display.val( this.hoverStartText );
        this.isHoveringAValue = false;
        this.$element.$display.removeClass( 'ge-e-display-hovered' );
        this.$element.$name.stop().animate( { opacity:1.00 }, 300 );
      };
      this.$element.$name.stop().animate( { opacity:1.00 }, 300 );
      this.hoverStartText = '';
      break;
    }
  };
  GE.EvalItemStep.prototype.handleBlur = function( blurEvent ){
  };

  // click on the value bar to set a new value
  GE.EvalItemStep.prototype.handleClick = function( clickEvent ){
    this.eval.value = $( clickEvent.target ).closest( 'td' ).index() + 1; // 1-based
    this.eval.text = clickEvent.target.textContent;
    this.$element.$item.find( '.ge-e-one-step' ).removeClass( 'ge-e-one-step-off' ).addClass( 'ge-e-one-step-on' );
    $( clickEvent.target ).nextAll().removeClass( 'ge-e-one-step-on' ).addClass( 'ge-e-one-step-off' );
    this.showText( this.eval.text );
    clickEvent.stopPropagation();
  };

  // handle keyboard input
  GE.EvalItemStep.prototype.handleKeydown = function( keyEvent ){
    // do nothing: QuickSearch does it
  };

  GE.EvalItemStep.prototype.buildHTML = function( evalData ){
    if( ! this.template ){
      this.template = _.template( this.templateSource );
    };
    return this.template( evalData );
  };

  GE.EvalItemStep.prototype.templateSource = 
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-step">' +
    '  <div class="ge-e-value">' +
    '    <table><tbody>' +
    '      <tr><% _.each( u.def.steps, function( evalItem, i, itemsList ){ %>' +
    '' +    '<td class="ge-e-one-step ge-e-one-step-<%= (i >= u.v.value)? "off":"on" %>" style="width:<%= 100 / u.def.steps.length %>%"><%= u.def.steps[i] %></td>' +
    '      <% } ) %></tr>' +
    '    </tbody></table>' +
    '  </div>' +
    '  <div class="ge-e-name<%= u.def.optional ? " ge-e-name-optional":"" %>"><%= u.def.description %></div>' +
    '  <input type="text" id="ge-e-stepInput" class="ge-e-display" tabindex="0" value="<%= u.v.text %>">' +
    '  <ul id="ge-e-stepInputChoices" class="ge-e-stepChoices" style="display:none;">' +
    '    <% _.each( u.def.steps, function( stepName, i, steps ){ %><li tabindex="0"><%= ( i + 1 ) + " " + stepName %></li><% }); %>' +
    '  </ul>' +
    '</div>';

  // set quicksearch in step-type eval itens
  GE.EvalItemStep.prototype.buildStepQS = function( $eventTarget ){
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

  //================================================================================
  // Class for spacer-type eval items
  //
  //     ####   #####     ##     ####   ######  #####
  //    #       #    #   #  #   #    #  #       #    #
  //     ####   #    #  #    #  #       #####   #    #
  //         #  #####   ######  #       #       #####
  //    #    #  #       #    #  #    #  #       #   #
  //     ####   #       #    #   ####   ######  #    #
  //
  // 8: { id:'8', type:'spacer' }
  GE.EvalItemSpacer = function( criteria, evalItemId ){
    this.element = undefined;  // ref to the associated DOM element
    this.criteria = criteria; 
    this.evalItemId = evalItemId;
    this.evalItem = GE.evalItems[ criteria ][ evalItemId ];
  };
  GE.EvalItemSpacer.prototype.setDOMElementReferences = function( $theItem ){
    this.$element = {}; // this item's internal elements
    this.$element.$item = $theItem;
  };

  // click on the value bar to set a new value
  GE.EvalItemSpacer.prototype.handleClick = function( clickEvent ){
    clickEvent.stopPropagation();
  };

  GE.EvalItemSpacer.prototype.buildHTML = function( evalData ){
    if( ! this.template ){
      this.template = _.template( this.templateSource );
    };
    return this.template( evalData );
  };
  GE.EvalItemSpacer.prototype.templateSource = 
    '<div id="ge-e-item-<%= u.def.id %>" class="ge-e-item ge-e-spacer">&nbsp;</div>';

  //================================================================================
  // Data items:

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

  // user groups defs, in this case the team and the others
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

  // current evaluee last two evaluations (1st is new or incomplete)
  GE.currentUserEvals = [];

  GE.currentUser = null; // selected user's file entry

  GE.mouseIsDown = false; // used to detect mouse vs. tab events

  //================================================================================

  // build users list
  GE.buildUsersList = function(){
    GE.usersAlreadyListed = []; // no users listed initially
    var templateSource = _.template( $( 'script#ge-template-users' ).html() ).source; // precompilation?
    var templateForUsers = _.template( $( 'script#ge-template-users' ).html() );
    var HTMLForUsers = templateForUsers( GE.userGroups );
    $( '#ge-evalueeGroups' ).html( HTMLForUsers );
    // add empty padding at the bottom of the users list to ensure scroll to top
    $( '#ge-padding' ).height( window.screen.height );
  };

  // Return the users belonging to a user group (a query)
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

  // Access users file with a user id as the key
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

  //================================================================================
  // Build eval items UI and activate event handlers

  GE.evalItemsBuild = function( $clickTarget, evaluationCriteria ){
    // TODO: remove the previous eval items set
    // build the eval items set UI for the clicked user, and an object for each item
    function doEvalItemBuild( evalItemClass, evaluationCriteria, evalData ){
      // common operations for all eval item types
      var evalItemObject = new evalItemClass( evaluationCriteria, evalData.def.id );
      var $theItem = $( evalItemObject.buildHTML( evalData ) );
      $UIElements.append( $theItem ); 
      $theItem.data( 'evalItemData', evalItemObject );
      evalItemObject.setDOMElementReferences( $theItem );
    };
    var $UIElements = $( '<div/>' ); // the eval items UI elements
    _.each(
      GE.evalItems[ evaluationCriteria ],
      function( evalItemDef, i, evalItemDefs ){
        var evalData = { def:evalItemDef, value:0, text:'' }; // object to be passed to templates
        evalData.v = GE.getEvalItemValue( evalItemDef.id ); // { value:..., text:..., hasValue:... }
        switch( evalItemDef.type ){
        case 'header':
          // 1: { id:'1', type:'header', description:'First group of eval items' },
          doEvalItemBuild( GE.EvalItemHeader, evaluationCriteria, evalData );
          break;
        case 'number':
          // 2: { id:'2', type:'number', description:'Positive idiosyncrasy', topValue:'3000' },
          evalData.v.width = Math.round( evalData.v.value / evalData.def.topValue * 10000 ) / 100;
          doEvalItemBuild( GE.EvalItemNumber, evaluationCriteria, evalData );
          break;
        case 'p100':
          // 3: { id:'3', type:'p100',   description:'Anthropometric synergic attitude' },
          evalData.v.width = evalData.v.value;
          doEvalItemBuild( GE.EvalItemP100, evaluationCriteria, evalData );
          break;
        case 'binary':
          // 6: { id:'6', type:'binary', description:'Has that success tendency' },
          if( evalData.v.hasValue ){
            evalData.v.text = evalData.v.value ? '\u274C' : '\u2713'; // ✓ &#x274c; ❌ &#x2713;
          } else {
            evalData.v.text = '';
          }
          doEvalItemBuild( GE.EvalItemBinary, evaluationCriteria, evalData );
          break;
        case 'step':
          // 7: { id:'7', type:'step',   description:'Advise acceptance', steps:['awful', 'low', 'regular', 'high', 'impressing'] },
          doEvalItemBuild( GE.EvalItemStep, evaluationCriteria, evalData );
          break;
        case 'spacer':
          // 8: { id:'8', type:'spacer' }CX    
          doEvalItemBuild( GE.EvalItemSpacer, evaluationCriteria, evalData );
          break;
        default:
          break;
        };
      }
    );
    // render the eval item UI, add the eval items set to the DOM
    var $HTMLTarget = $( '#ge-evaluations-' + GE.currentUser.id );
    $HTMLTarget.append( $UIElements );
    GE.setEvalItemHoverHandlers();
  };

  // given an element of an evaluation item, return a reference to its data object
  GE.getEvalItemData = function( $evalItem ){
    return $evalItem.closest( '.ge-e-item' ).data( 'evalItemData' );
  };

  //================================================================================
  // Evals UI event handlers

  GE.setEvalItemHoverHandlers = function(){
    // when hovering an eval item, show the value associated with the pointer's position
    $( '.ge-e-value' ).on(
      'mouseenter.eihh mousemove.eihh mouseleave.eihh',
      function( event ){
        var $theItem = $( event.target ).closest( '.ge-e-item' );
        $theItem.data( 'evalItemData' ).handleHover( event );
      }
    );
  };

  GE.handleEvalClick = function( $e, event ){
    // handle click on a value to change it
    if( ! $e.closest( '.ge-e-value' ).length ){ return; }
    var eio = GE.getEvalItemData( $e );
    if( eio.$element.$display ){
      eio.isHoveringAValue = false;
      eio.$element.$display.removeClass( 'ge-e-display-hovered' )
      eio.handleClick( event );
      event.stopPropagation();
      // TODO: store evaluation values in the model here
    };
  };

  GE.activateEvalItemKBHandler = function( $eventTarget ){
    // the display of an eval item has got focus and gets KB input
    $eventTarget.off( 'keypress' );

    var eio = GE.getEvalItemData( $eventTarget );
    var evalItemDef = eio.evalItem;
    eio.buildStepQS && eio.buildStepQS( $eventTarget, evalItemDef );

    $eventTarget.on(
      'keypress',
      evalItemDef,
      function( keyEvent ){
        var eio = GE.getEvalItemData( $( keyEvent.target ) );
        eio.handleKeydown( keyEvent );
        keyEvent.stopPropagation();
      }
    )
  };

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
    var beepSound = new Audio('data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/It' +
        'AAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeI' +
        'IIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvx' +
        'gxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//' +
        'dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYI' +
        'uP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQU' +
        'YkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugA' +
        'AAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1' +
        'AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgH' +
        'vAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8O' +
        'YU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBY' +
        'YZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKm' +
        'qP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgA' +
        'fgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYU' +
        'EIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW' +
        '+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCEx' +
        'ivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTE' +
        'I0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULH' +
        'DZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyi' +
        'pKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD5' +
        '9jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIM' +
        'eeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/Dm' +
        'AMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2' +
        'dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVM' +
        'QQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3' +
        'dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAA' +
        'ngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg' +
        '4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2' +
        'c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtEr' +
        'm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+' +
        'sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQ' +
        'NpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho' +
        '1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH100' +
        '00EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu' +
        '9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqA' +
        'rFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoO' +
        'IAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40Go' +
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

  //================================================================================
  // START HERE:
    // _.each(list, iteratee, [context]) Alias: forEach 
    // Each invocation of iteratee is called with three arguments: (element, index, list).
    // If list is a JavaScript object, iteratee's arguments will be (value, key, list).

  $(document).ready( function (){

    // build users list
    GE.buildUsersList();

    // handle click event on a user data or on evaluations
    $( '#ge-evalueeGroups .ge-users-group' ).on(
      'mouseup',
      function( event ){
        if( event.which !== 1 ) { return; } // not the primary button
        $clickTarget = $( event.target );
        var $LIContainer = $clickTarget.closest( 'li' );
        // get user's data
        var currentUserId = $LIContainer[0].id.split('-')[2]; // "5" of "ge-user-5"
        GE.currentUser = GE.getUserData( currentUserId );
        // check if eval items UI is already rendered
        var $userEvals = $LIContainer.find('.ge-evaluations');
        if( ! $userEvals.hasClass( 'ge-loaded' ) ){
          $( '.ge-e-value' ).off( ".eihh" ); // remove prior event handlers
          $( '.ge-evalueeGroups' ).find( '.ge-evaluations.ge-loaded' ).removeClass( 'ge-loaded' ).empty();

          GE.currentUserEvals = GE.getCurrentUserEvals( GE.currentUser.id, GE.currentUser.evaluationCriteria );
          GE.evalItemsBuild( $clickTarget, GE.currentUser.evaluationCriteria );
          $userEvals.addClass( 'ge-loaded' );
          $userEvals.slideDown( 400 );
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

    // handle focus on evaluee data or eval items
    $( '.ge-evalueesGroup' ).on(
      'focus',
      '.ge-oneUser',
      function( event ){
        var $eventTarget = $( event.target );
        if( $eventTarget.hasClass( 'ge-oneUser' ) ){      // focus on evaluee header
          $eventTarget.trigger( { type: 'mouseup', which: 1 } ); // user: display eval items UI
        } else {                                          // focus on eval item
          var eio = GE.getEvalItemData( $eventTarget );   // the eval item object
          GE.activateEvalItemKBHandler( $eventTarget );   // TODO: this does nothing
          $eventTarget.one(                               // set blur event
            'blur',
            eio,
            function( event ){
              eio.handleBlur && eio.handleBlur( event );
            }
          );
        };
        event.stopPropagation();
      }
    );

  });
