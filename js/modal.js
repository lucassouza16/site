var qbody = query('body');

function modal(seletor){

  var self;

  if(modal.instancias.get(seletor) != null){
    self = modal.instancias.get(seletor);
  }else{
    self = {
      'dom' : seletor.isManipulador ? seletor : query(seletor),
      'timeout' : null,
      'onopen' : null,
      'onclose' : null,
      'animacao' : null,
      'duracao' : 0,
      'aberta' : false,
      'bloqueiaScroll' : false,
      'open' : function(){
        self.dom.style.set({
          'display' : 'block',
          'animation-name' : self.animacao,
          'animation-direction' : 'normal',
        });

        self.dom.classes.add('opening');

        if(self.onopen != null) self.onopen();
        if(self.timeout != null) clearTimeout(self.timeout);

        self.timeout = setTimeout(function(){
          if(self.bloqueiaScroll) qbody.classes.add('modal-bloqueia-scroll');
          self.dom.style.set({
            'animation-name' : null,
            'animation-direction' : null
          });
          self.dom.classes.remove('opening');
          self.aberta = true;
        }, self.duracao);
      },

      'close' : function(){
        self.dom.style.set({
          'animation-name' : self.animacao,
          'animation-direction' : 'reverse'
        });
        self.dom.classes.add('closing');
        if(self.onclose != null) self.onclose();
        if(self.timeout != null) clearTimeout(self.timeout);

        self.timeout = setTimeout(function(){
          if(self.bloqueiaScroll) qbody.classes.remove('modal-bloqueia-scroll');
          self.dom.style.set({
            'display' : 'none',
            'animation-name' : null,
            'animation-direction' : null
          });
          self.dom.classes.remove('closing');
          self.aberta = false;
        }, self.duracao);
      },

      'toggle' : function(){
        if(self.aberta){
          self.close();
        }else{
          self.open();
        }
      },

      'init' : function(){
        this.duracao = query.string.toInt(this.dom.attrb.get('duracao-modal')) || 500;
        this.animacao = this.dom.attrb.get('animacao-modal');
        this.bloqueiaScroll = this.dom.attrb.get('modal-bloqueia-scroll') == 'true' ? true : false;
        this.fechaSeClicaFora = this.dom.attrb.get('fecha-clica-fora') == 'false' ? false : true;

        this.dom.style.set({
          'display' : 'none',
          'animation-duration' : this.duracao+'ms'
        });

        modal.instancias.add(this);
        return this;
      }
    }.init();
  }

  return self;
}

modal['instancias'] = {
  'modaisInst' : [],
  'get' : function(param){
    var modalNode = param.isManipulador ? param : query(param);

    for (var i = 0; i < this.modaisInst.length; i++) {
      if(this.modaisInst[i].dom.nodes[0] === modalNode.nodes[0]){
        return this.modaisInst[i];
      }
    }

    return null;
  },

  'add' : function(param){
    this.modaisInst.push(param);
  }
};


query('.btn-abre-modal').event.add('click', function(evt){
  modal(query(this).attrb.get('modal-alvo')).open();
});

query('.btn-fecha-modal').event.add('click', function(evt){
  modal(query(this).attrb.get('modal-alvo')).close();
});

query('.btn-alterna-modal').event.add('click', function(evt){
  modal(query(this).attrb.get('modal-alvo')).toggle();
});

query('.item-modal').fulleach(function(item){
  modal(item);
});

query(window).event.add('click', function(evt){
  for (var i = 0; i < modal.instancias.modaisInst.length; i++) {
    var modalAt = modal.instancias.modaisInst[i];

    if(modalAt.aberta && !modalAt.dom.child.contains(evt.target) && modalAt.fechaSeClicaFora){
      modalAt.close();
    }
  }
});
