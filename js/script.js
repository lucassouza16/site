var botsScrollEl = query('.scroll-para-elemento');
var menuTopo = query('#menu-principal');
var btnAbreMenu = query('#abrir-menu');
var btnSubirPagina = query('#subir-para-cima');
var menuNavDrop = modal('#menu-nav-dropdown');
var modalDetPortf = new ModalPortifolio('#modal-detalhes-item-portifolio', '.item-portifolio');
var graficos = query('.grafico-pizza');

botsScrollEl.event.add('click', function(e){
	var alvo = query(this).attrb.get('href');
	var pos = query(alvo).offset.top();

	query(document).scroll.to(pos, 1000);
	query.event.prevent(e);
});

var animaItems = query('.anima-scroll-item');

var timeAnim = null;

if(window.innerWidth > 900) animaItems.style.set('opacity' , '0');

query(window).event.add('resize', function(){
	if(window.innerWidth <= 900){
		animaItems.style.set('opacity' , '1');
	}
});

query(document).event.add('scroll', function(){
	var tScrollTop = query(this).scroll.top();

	if(tScrollTop == 0){
		btnSubirPagina.classes.add('inacessivel');
	}else{
		btnSubirPagina.classes.remove('inacessivel');
	}

	if(!menuTopo.scroll.visible()){
		btnAbreMenu.classes.remove('inacessivel');
	}else{
		btnAbreMenu.classes.add('inacessivel');
		if(menuNavDrop.aberta){
			menuNavDrop.close();
		}
	}

	clearTimeout(timeAnim);

	timeAnim = setTimeout(function(){
		animaItems.fulleach(function(item){
			if(window.innerWidth > 900){
				if(item.scroll.visible()){
					item.style.set({
						'opacity' : '1',
						'animation-name' : item.attrb.get('animacao')
					});
				}else{
					item.style.set({
						'opacity' : '0',
						'animation-name' : null
					});
				}
			}
		});
	}, 150);
});

animaItems.fulleach(function(item){

	item.style.set({
		'animation-delay' : '0ms',
		'animation-duration' : item.attrb.get('duracao')+'ms',
		'backface-visibility' : 'hidden'
	});
});

btnSubirPagina.event.add('click', function(){
	query(document).scroll.to(0, 800);
});

menuNavDrop.onopen = function(){
	btnAbreMenu.classes.add('aberto');
};

menuNavDrop.onclose = function(){
	btnAbreMenu.classes.remove('aberto');
};

graficos.fulleach(function(item){
	var pct = item.attrb.get('porcento');
	var tit = item.attrb.get('titulo');

	var raio = 50;
	var circunferencia = 2*Math.PI*raio;

	var svg = item.child.create('svg', {
		'viewBox' : '-60 -60 120 120',
		'fill' : 'white'
	}, 'http://www.w3.org/2000/svg');

	var textPc = svg.child.create('text', {
		'text-anchor' : 'middle',
		'font-size' : '20',
		'fill' : 'white'
	}, 'http://www.w3.org/2000/svg');

	textPc.text(pct+'%');

	var textTit = svg.child.create('text', {
		'text-anchor' : 'middle',
		'dy' : '15',
		'font-size' : '13'
	}, 'http://www.w3.org/2000/svg');

	textTit.text(tit);

	var circulo = svg.child.create('circle', {
		'r' : 50,
		'stroke' : '#25022b',
		'stroke-width' : '10',
		'fill' : 'transparent',
		'transform' : 'rotate(-90)',
		//'stroke-linecap': 'round',
		'stroke-dasharray' : circunferencia,
		'stroke-dashoffset' : ((100 - pct)/100) * circunferencia
	}, 'http://www.w3.org/2000/svg');
});

var idade = new Date().getFullYear() - 1996;

query('.at-minha-idade').inner.text(idade);
