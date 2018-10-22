function checkForm(props){
  var self = {
    'props' : props,
    'form' : props.form.isManipulador ? props.form : query(props.form),
    'inputs' : {
      'lista' : [],
      'getInput' : function(name){
        for (var i = 0; i < this.lista.length; i++) {
          if(this.lista[i].name == name){
            return this.lista[i];
          }
        }

        return null;
      },
      'init' : function(){
        var inpts = self.form.query('input, select, textarea');

        for (var i = 0; i < inpts.fullnodes.length; i++) {
          var node = inpts.fullnodes[i];
          var nameInput = node.attrb.get('name');

          var input = {
            'name' : nameInput,
            'input' : node,
            'dialog' : node.parent.get().child.create('div', {
              'class' : self.props.classDialog || '',
              'style' : 'display: none;'
            })
          };

          if(self.props.inputs && self.props.inputs[nameInput]){
            configInput = self.props.inputs[nameInput];

            if(configInput.obrigatorio != undefined){
              input.obrigatorio = true;
              input.msgObrigatorio = configInput.obrigatorio.mensagem || 'O campo e obrigatório';
            }else{
              input.obrigatorio = false;
            }

            if(configInput.validavel != undefined){
              input.validavel = true;
              input.padraoValidar = configInput.validavel.padrao;
              input.msgValidavel = configInput.validavel.mensagem || 'O campo e invalido';
            }else{
              input.validavel = false;
            }

            if(configInput.comparavel != undefined){
              input.comparavel = true;
              input.comparaCom = configInput.comparavel.com;
              input.msgComparavel = configInput.comparavel.mensagem || 'Os campos apresentam valores diferentes';
            }else{
              input.comparavel = false;
            }
          }

          this.lista.push(input);
        }

        return this;
      }
    },

    'init' : function(){
      this.inputs.init();

      this.form.event.add('reset', function(){
        for (var i = 0; i < self.inputs.lista.length; i++) {
          var dialog = self.inputs.lista[i].dialog;
          dialog.classes.remove('back-erro').remove('back-aviso');
          dialog.style.set('display', 'none');
          dialog.inner.text('');
        }
      });

      this.form.event.add('submit', function(e){

        var podeProsseguir = true;

        for (var i = 0; i < self.inputs.lista.length; i++) {
          var input = self.inputs.lista[i];

          input.dialog.classes.remove('back-erro').remove('back-aviso');
          input.dialog.inner.text('');
          if(input.obrigatorio && input.input.value.get() == ''){
            podeProsseguir = false;
            input.dialog.style.set('display', 'block');
            input.dialog.classes.add('back-erro');
            input.dialog.inner.text(input.msgObrigatorio);
          }else if(input.validavel && input.input.value.get().search(input.padraoValidar) == -1){
            podeProsseguir = false;
            input.dialog.style.set('display', 'block');
            input.dialog.classes.add('back-aviso');
            input.dialog.inner.text(input.msgValidavel);
          }else if(input.comparavel &&
            input.input.value.get() != self.inputs.getInput(input.comparaCom).input.value.get()){
              podeProsseguir = false;
              input.dialog.style.set('display', 'block');
              input.dialog.classes.add('back-aviso');
              input.dialog.inner.text(input.msgComparavel);
            }else{
              input.dialog.style.set('display', 'none');
            }
          }

          if(podeProsseguir){
            if(self.props.submeter){
              self.props.submeter(e, self.form.nodes[0]);
            }
          }else{
            query.event.prevent(e);
          }
        });

        return this;
      }
    };

    return self.init();
  }
