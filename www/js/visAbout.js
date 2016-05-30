function fillAbout() {
    var html = '';
	html += '<ul style="font-size: 1.1em; line-height: 2em; display: inline;">';
    html += '    <li><a href="http://iobroker.net/" target="_blank" class="translate">' + _('Web') + '</a></li>';
    html += '    <li><a href="http://forum.iobroker.net" target="_blank" class="translate">' + _('Community') + '</a></li>';
    html += '    <li><a href="https://github.com/ioBroker/ioBroker.vis/blob/master/README.md" target="_blank" class="translate">' + _('Change log') + '</a>';
    html += '    </li>';
    html += '</ul>';

    html += '<h4>Copyright &copy; 2013-2016 <a href="https://github.com/GermanBluefox" target="_blank">Bluefox</a>,';
	html += '   <a href="https://hobbyquaker.github.io" target="_blank">hobbyquaker</a></h4>';

    html += '<p>CC BY-NC License 4.0</p><a href="http://creativecommons.org/licenses/by-nc/4.0/"><img src="img/cc-nc-by.png"/></a>';
    html += '<p>' + _('license5') + '</p>';
    html += '<p>' + _('icons8') + '</p>';
	return html;
}
