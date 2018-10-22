var query = function(seletor){
  var self = {
    'isManipulador' : true,

    'seletor' : seletor,

    'nodes' : [],

    'fullnodes' : [],

    'foreach' : function(func){
      for (var i = 0; i < self.nodes.length; i++) {
        func(self.nodes[i], i);
      }
    },

    'fulleach' : function(func){
      for (var i = 0; i < self.fullnodes.length; i++) {
        func(self.fullnodes[i], i);
      }
    },

    'size' : function(){
      return self.nodes.length;
    },

    'query' : function(selet){
      var send = [];

      self.foreach(function(node){
        if(query.element.isValidSelector(selet)){
          var qsa = node.querySelectorAll(selet);

          for (var i = 0; i < qsa.length; i++) {
            if(query.array.indexOf(send, qsa[i]) == -1){
              send.push(qsa[i]);
            }
          }
        }else{
          console.error('O seletor: '+selet+' é inválido');
        }
      });

      return query(send);
    },

    'text' : function(param){
      if(param!=undefined){
        self.foreach(function(item){
          item.textContent = param;
        });
      }

      return self.nodes[0].textContent;
    },

    'event' : {
      'add' : function(callBck, func){

        var calls = callBck.split(' ');

        self.foreach(function(node){
          for (var i = 0; i < calls.length; i++) {
            var call = calls[i];

            if(window.addEventListener){
              node.addEventListener(call, func);
            }else if(window.attachEvent){
              var fcDsp = function(e){
                func.call(node, e);
              };

              node.attachEvent('on'+call, fcDsp);
              query.dados.eventos.add(call, func, fcDsp, node);
            }
          }
        });

        return this;
      },
      'remove' : function(callBck, func){

        var calls = callBck.split(' ');

        self.foreach(function(node){
          for (var i = 0; i < calls.length; i++) {
            var call = calls[i];

            if(window.removeEventListener){
              node.removeEventListener(call, func);
            }else if(window.detachEvent){
              var funcao = query.dados.eventos.remove(call, func, node);

              if(funcao != null){
                node.detachEvent('on'+call, funcao.fcDsp);
              }
            }
          }
        });

        return this;
      }
    },

    'offset' : {
      'top' : function(){
        return self.nodes[0].offsetTop;
      },
      'left' : function(){
        return self.nodes[0].offsetLeft;
      },
      'width' : function(){
        return self.nodes[0].offsetWidth;
      },
      'height' : function(){
        return self.nodes[0].offsetHeight;
      }
    },

    'scroll' : {
      'visible' : function(tolerancia){

        var scrY = window.pageYOffset;
        var offTop = self.nodes[0].offsetTop;
        var offHeight = self.nodes[0].offsetHeight;

        return scrY + window.innerHeight > offTop &&
        scrY < offTop + offHeight;
      },

      'to' : function(pos, tempo){
        self.foreach(function(node){
          if(!query.dados.scroll.existe(node)){
            var scrollEl = node === document ?
            (document.scrollingElement || document.documentElement) : node;

            var posAtual = scrollEl.scrollTop;

            if(posAtual == pos){
              return;
            }else{
              query.dados.scroll.add(node);
            }

            var modo = posAtual > pos ? 1 : -1;

            var dist = (posAtual - pos) * modo;

            var distMet = dist/2;

            var decr = 1;

            var passos = [];

            while(distMet > 0){
              distMet -= decr;
              passos.push(Math.round(decr));
              decr+=decr/6;

              if(distMet - decr < 0){
                passos[passos.length-1] += Math.round(distMet);
                distMet = 0;
              }
            }

            var passos_length = passos.length;

            for (var i = passos_length - 1; i >= 0; i--) {
              passos.push(passos[i]);
            }

            for (var i = 0; i < passos.length; i++) {
              posAtual -= (passos[i]*modo);
              passos[i] = posAtual;
            }

            var passoAt = 0;
            var tempoPasso = Math.round(tempo/passos.length);

            var travarScr = function(e){
              query.event.prevent(e);
            };

            query(node).event.add('mousewheel', travarScr);

            var interval = setInterval(function(){
              scrollEl.scrollTop = passos[passoAt];
              passoAt++;

              if(passoAt == passos.length){
                scrollEl.scrollTop = pos;
                query.dados.scroll.remove(node);
                query(node).event.remove('mousewheel', travarScr);
                clearInterval(interval);
              }
            }, tempoPasso);
          }
        });
      },

      'top' : function(pos){
        var scrollEl = self.nodes[0] === document ?
        (document.scrollingElement || document.documentElement) : self.nodes[0];

        if(pos != undefined) scrollEl.scrollTop = pos;

        return scrollEl.scrollTop;
      }
    },

    'bounding' : {
      'x' : function(){
        return self.nodes[0].getBoundingClientRect().x;
      },

      'y' : function(){
        return self.nodes[0].getBoundingClientRect().y;
      }
    },

    'attrb' : {
      'get' : function(attrb){
        return self.nodes[0].getAttribute(attrb) || '';
      },
      'set' : function(attrb, valor){
        self.foreach(function(node){
          node.setAttribute(attrb, valor);
        });
      }
    },

    'style' : {
      'get' : function(attrb){
        return self.nodes[0].style[attrb];
      },
      'set' : function(arg1, arg2){
        if(typeof arg1 == 'string'){
          self.foreach(function(node){
            node.style[arg1] = arg2;
          });
        }else{
          self.foreach(function(node){
            for (var attrb in arg1) {
              node.style[attrb] = arg1[attrb];
            }
          });
        }

        return this;
      },
      'computed' : function(attrb){
        if(window.getComputedStyle != undefined){
          return window.getComputedStyle(self.nodes[0], null).getPropertyValue(attrb);
        }else{
          self.nodes[0].currentStyle[attrb];
        }
      }
    },

    'classes' : {
      'exist' : function(classe){
        var classAt = self.attrb.get('class') || '';
        var reg = new RegExp('^'+classe+'\\s|\\s'+classe+'\\s|\\s'+classe+'$|^'+classe+'$');
        return classAt.search(reg) != -1;
      },

      'add' : function(classe){
        if(!this.exist(classe)){
          var classeAt = self.attrb.get('class') || '';
          self.attrb.set('class', query.string.trim(classeAt+' '+classe));
        }

        return this;
      },

      'remove' : function(classe){
        var classeAt = self.attrb.get('class') || '';
        var reg = new RegExp('^'+classe+'\\s|(\\s)'+classe+'\\s|\\s'+classe+'$|^'+classe+'$');
        var classeNv = classeAt.replace(reg, '$1');
        self.attrb.set('class', classeNv);

        return this;
      },

      'toggle' : function(classe){
        if(this.exist(classe)){
          this.remove(classe);
        }else{
          this.add(classe);
        }

        return this;
      },

      'exchange' : function(class1, class2){
        if(this.exist(class1)){
          this.remove(class1).add(class2);
        }else if(this.exist(class2)){
          this.remove(class2).add(class1);
        }else{
          this.add(class1);
        }
      }
    },

    'fullscreen' : {
      'on' : function(){
        var elem = self.nodes[0];
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
      },
      'off' : function(){
        if (document.CancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.msCancelFullScreen) {
          document.msCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    },

    'child' : {
      'append' : function(){
        var args = Array.prototype.slice.call(arguments);

        for (var i = 0; i < args.length; i++) {
          var arg = args[i];
          var selecs;
          var node = self.nodes[0];

          selecs = arg.isManipulador ? arg : query(arg);

          selecs.foreach(function(item){
            node.appendChild(item);
          });
        }

        return this;
      },

      'create' : function(tipo, configs, qualified){
        var elem = query.element.create(tipo, configs, qualified);

        self.nodes[0].appendChild(elem.nodes[0]);
        return elem;
      },

      'remove' : function(){
        var args = Array.prototype.slice.call(arguments);

        for (var i = 0; i < args.length; i++) {
          var arg = args[i];
          var selecs;
          var node = self.nodes[0];

          selecs = arg.isManipulador ? arg : query(arg);

          selecs.foreach(function(item){
            if(node.contains(item)){
              node.removeChild(item);
            }
          });
        }

        return this;
      },

      'contains' : function(param){
        var pert = param.isManipulador ? param : query(param);

        return self.nodes[0].contains(pert.nodes[0]);
      }
    },

    'parent' : {
      'get' : function(){
        return query(self.nodes[0].parentNode);
      }
    },

    'inner' : {
      'text' : function(param){
        if(param != undefined){
          self.foreach(function(node){
            node.innerText = param;
          });
        }

        return self.nodes[0].innerText;
      },

      'html' : function(param){
        if(param != undefined){
          self.foreach(function(node){
            node.innerHTML = param;
          });
        }

        return self.nodes[0].innerHTML;
      }
    },

    'value' : {
      'get' : function(){
        return self.nodes[0].value;
      },

      'set' : function(val){
        self.foreach(function(node){
          node.value = val;
        });
      }
    },

    'form' : {
      'reset' : function(){
        self.nodes[0].reset();
      },

      'input' : function(name){
        return query(self.nodes[0][name]);
      }
    },

    'init' : function(){
      var tipo = query.object.getType(this.seletor);

      switch (tipo) {
        case 'string':

        if(query.element.isValidSelector(this.seletor)){
          var nodes = document.querySelectorAll(this.seletor);

          for (var i = 0; i < nodes.length; i++) {
            this.nodes.push(nodes[i]);
            this.fullnodes.push(query(nodes[i]));
          }
        } else {
          console.error('O seletor: '+this.seletor+' é inválido');
        }

        break;
        case 'array':
        for (var i = 0; i < this.seletor.length; i++) {
          this.nodes.push(this.seletor[i]);
          this.fullnodes.push(query(this.seletor[i]));
        }

        break;
        default:
        this.nodes.push(this.seletor);
      }

      return this;
    }
  };

  return self.init();
};

query.dados = {
  'eventos' : {
    'listaEventos' : [],
    'add' : function(call, fcOr, fcDsp, node){
      this.listaEventos.push({
        'call' : call,
        'fcOr' : fcOr,
        'fcDsp' : fcDsp,
        'node' : node
      });
    },
    'remove' : function(call, fcOr, node){
      for (var i = 0; i < this.listaEventos.length; i++) {
        var evento = this.listaEventos[i];

        if(evento.call == call && evento.fcOr === fcOr && evento.node === node){
          this.listaEventos.splice(i, 1);

          return evento;
        }
      }

      return null;
    }
  },

  'scroll' : {
    'listaAnimacoes' : [],
    'add' : function(node){
      this.listaAnimacoes.push(node);
    },

    'existe' : function(node){
      return query.array.indexOf(this.listaAnimacoes, node) != -1;
    },

    'remove' : function(node){
      this.listaAnimacoes.splice(query.array.indexOf(this.listaAnimacoes, node), 1);
    }
  }
};

query['string'] = {
  'trim' : function(str){
    return str.replace(/^\s*|\s*$/g, '');
  },

  'toInt' : function(str){
    return parseInt(str.replace(/[^0-9]/g, ''));
  },

  'unserialize' : function(str){
    var txt = str.replace(/^\?/, '');

    var dados = txt.split('&');
    var ret = {};

    for (var i = 0; i < dados.length; i++) {
      var prm = dados[i].split('=');
      ret[prm[0]] = prm[1];
    }

    return ret;
  }
};

query['object'] = {
  'getType' : function(obj){
    return obj.constructor.toString().replace(/\n/g, '')
    .replace(/^function\s(.*)\(.*$/, '$1').toLowerCase();
  }
};

query['event'] = {
  'prevent' : function(e){
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
  }
};

query['array'] = {
  'indexOf' : function(array, elem){
    for (var i = 0; i < array.length; i++) {
      if(elem === array[i]){
        return i;
      }
    }

    return -1;
  }
};

query['element'] = {
  'isValidSelector' : function(seletor){
    try {
      document.querySelector(seletor);
      return true;
    } catch (e) {
      return false;
    }
  },

  'create' : function(tipo, props, qualified){
    var node = query(
      qualified == undefined ? document.createElement(tipo) : document.createElementNS(qualified, tipo)
    );

    if(props != null){
      for (var prop in props) {
        var val = props[prop];

        node.attrb.set(prop, val);
      }
    }

    return node;
  }
};

query['json'] = {
  'decode' : function(text){
    try{
      return eval('('+text+')');
    }catch(e){
      console.error('Ocorreu um erro ao decodificar o formato JSON');
    }
  }
};

query['ajax'] = {
  'send' : function(config){
    var request = new XMLHttpRequest();

    request.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        if(config.retorno == 'JSON'){
          config.receber(query.json.decode(this.responseText));
        }else{
          config.receber(this.responseText);
        }
      }
    };

    request.open(config.metodo || 'GET', config.destino, true);

    var frmDt;

    if(query.object.getType(config.params) == 'string'){
      var prms = query.string.unserialize(config.params);
      frmDt = new FormData();

      for (var i in prms) {
        frmDt.append(i, prms[i]);
      }
    }else{
      frmDt = config.params;
    }

    request.send(frmDt);
  }
};
