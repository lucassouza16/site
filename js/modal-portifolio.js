function ModalPortifolio(sel, itens){
  var self = this;

  self.modal = modal(sel);
  self.dom = self.modal.dom;
  self.itens = query(itens);
  self.imgPortif = self.dom.query('.imagem-item-portifolio');
  self.titItemPortif = self.dom.query('.titulo-item-portifolio');
  self.modalContainer = self.dom.query('.container-dados-item-portifolio');

  self.itens.event.add('click', function(e){
    query.event.prevent(e);
    var item = query(this);
    self.modalContainer.inner.html(item.query('.conteudo-portifolio-hidden').inner.html());
    self.imgPortif.attrb.set('src', item.query('.img-portifolio').attrb.get('src'));
    self.titItemPortif.inner.text(item.query('.titulo-item-portifolio').inner.text());

    self.modal.open();
  });
}
