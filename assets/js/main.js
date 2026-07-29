/*
	Alpha by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body');

	// Breakpoints.
		breakpoints({
			wide:      ( '1281px',  '1680px' ),
			normal:    ( '981px',   '1280px' ),
			narrow:    ( '737px',   '980px'  ),
			narrower:  ( '737px',   '840px'  ),
			mobile:    ( '481px',   '736px'  ),
			mobilep:   ( null,      '480px'  )
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// NavPanel.

		// Button.
			$(
				'<div id="navButton">' +
					'<a href="#navPanel" class="toggle"></a>' +
				'</div>'
			)
				.appendTo($body);

		// Panel.
			$(
				'<div id="navPanel">' +
					'<nav>' +
						$('#nav').navList() +
					'</nav>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'left',
					target: $body,
					visibleClass: 'navPanel-visible'
				});

	// Theme (light / dark) toggle.
	// The initial theme is applied by an inline script in <head> before first
	// paint; this module only renders the buttons and handles switching.
		(function() {
			var root = document.documentElement;
			var buttons = [];

			function isDark() {
				return root.getAttribute('data-theme') === 'dark';
			}

			function syncButtons() {
				var dark = isDark();

				buttons.forEach(function(btn) {
					var icon = btn.querySelector('i');
					var label = btn.querySelector('.theme-label');

					btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
					if (icon)
						icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
					if (label)
						label.textContent = dark ? 'Light Mode' : 'Dark Mode';
				});
			}

			function toggleTheme() {
				if (isDark())
					root.removeAttribute('data-theme');
				else
					root.setAttribute('data-theme', 'dark');

				try {
					localStorage.setItem('site-theme', isDark() ? 'dark' : 'light');
				} catch (e) {}

				syncButtons();
			}

			function makeButton(className, withLabel) {
				var btn = document.createElement('button');

				btn.type = 'button';
				btn.className = className;
				btn.innerHTML = '<i aria-hidden="true"></i>'
					+ (withLabel ? '<span class="theme-label"></span>' : '');
				btn.addEventListener('click', toggleTheme);
				buttons.push(btn);
				return btn;
			}

			var navList = document.querySelector('#header nav > ul');

			if (navList) {
				var li = document.createElement('li');

				li.className = 'theme-toggle-item';
				li.appendChild(makeButton('theme-toggle', false));
				navList.appendChild(li);
			}

			var panelNav = document.querySelector('#navPanel nav');

			if (panelNav)
				panelNav.appendChild(makeButton('theme-toggle-panel', true));

			syncButtons();
		})();

	// Liquid navigation indicator.
		(function() {
			var navOrder = [
				'index.html',
				'publications.html',
				'projects.html',
				'talks.html',
				'teaching.html',
				'activities.html'
			];
			var navTiming = {
				moveRight: 500,
				moveLeft: 600,
				navigationBuffer: 40
			};
			var nav = document.querySelector('#header nav');
			var list = nav ? nav.querySelector('ul') : null;
			var activeLink = list ? list.querySelector('a[aria-current="page"]') : null;

			if (!list || !activeLink)
				return;

			var indicator = document.createElement('li');
			var indicatorAnimation;
			var navigationTimer;
			var activeRoute = getRouteKey(activeLink.href);
			var activeIndex = navOrder.indexOf(activeRoute);

			function getRouteKey(url) {
				var pathname = new URL(url, window.location.href).pathname;
				var route = pathname.substring(pathname.lastIndexOf('/') + 1);
				return route || 'index.html';
			}

			function getDirection(fromRoute, toRoute) {
				var fromIndex = navOrder.indexOf(fromRoute);
				var toIndex = navOrder.indexOf(toRoute);

				if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex)
					return null;

				return toIndex < fromIndex ? 'left' : 'right';
			}

			indicator.className = 'nav-liquid-indicator no-transition';
			indicator.setAttribute('aria-hidden', 'true');
			list.insertBefore(indicator, list.firstChild);

			function moveIndicator(link, animate, sourceLink, direction) {
				var listRect = list.getBoundingClientRect();
				var linkRect = link.getBoundingClientRect();
				var sourceRect = sourceLink
					? sourceLink.getBoundingClientRect()
					: indicator.getBoundingClientRect();
				var currentLeft = sourceRect.left - listRect.left;
				var currentWidth = sourceRect.width;
				var targetLeft = linkRect.left - listRect.left;
				var targetWidth = linkRect.width;

				if (indicatorAnimation) {
					indicatorAnimation.cancel();
					indicatorAnimation = null;
				}

				if (animate && indicator.animate) {
					var movingRight = direction ? direction === 'right' : targetLeft > currentLeft;
					var animationDuration = movingRight ? navTiming.moveRight : navTiming.moveLeft;

					// Liquid flow: the leading edge stretches out to the target
					// first (the pill briefly spans both buttons and squashes
					// slightly), then the trailing edge catches up.
					var stretchLeft = Math.min(currentLeft, targetLeft);
					var stretchWidth = Math.max(currentLeft + currentWidth, targetLeft + targetWidth) - stretchLeft;
					var animation;

					indicator.classList.add('no-transition');
					animation = indicator.animate([
						{
							transform: 'translate3d(' + currentLeft + 'px, 0, 0)',
							width: currentWidth + 'px',
							easing: 'cubic-bezier(0.3, 0, 0.2, 1)'
						},
						{
							transform: 'translate3d(' + stretchLeft + 'px, 0, 0) scaleY(0.94)',
							width: stretchWidth + 'px',
							offset: 0.42,
							easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
						},
						{
							transform: 'translate3d(' + targetLeft + 'px, 0, 0)',
							width: targetWidth + 'px'
						}
					], {
						duration: animationDuration,
						fill: 'forwards'
					});
					indicatorAnimation = animation;

					animation.addEventListener('finish', function() {
						if (indicatorAnimation !== animation)
							return;

						indicator.style.width = targetWidth + 'px';
						indicator.style.transform = 'translate3d(' + targetLeft + 'px, 0, 0)';
						animation.cancel();
						indicatorAnimation = null;
						indicator.classList.remove('no-transition');
					});
					return animationDuration;
				}

				indicator.classList.toggle('no-transition', !animate);
				indicator.style.width = targetWidth + 'px';
				indicator.style.transform = 'translate3d(' + targetLeft + 'px, 0, 0)';
				return navTiming.moveRight;
			}

			nav.classList.add('has-liquid-indicator');

			// Place the indicator without animation: commit the final styles
			// via a forced reflow while transitions are disabled, so removing
			// no-transition afterwards cannot trigger a slide from the left.
			function placeIndicator() {
				moveIndicator(activeLink, false);
				indicator.getBoundingClientRect();
				indicator.classList.remove('no-transition');
			}

			placeIndicator();

			window.addEventListener('resize', placeIndicator);

			window.addEventListener('pageshow', function(event) {
				if (!event.persisted)
					return;

				window.clearTimeout(navigationTimer);
				list.querySelectorAll('.is-liquid-target').forEach(function(item) {
					item.classList.remove('is-liquid-target');
				});
				placeIndicator();
			});

			list.addEventListener('click', function(event) {
				var link = event.target.closest('a[href]');

				if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank')
					return;

				// Re-clicking the current page's link should do nothing
				// instead of reloading the page.
				if (link === activeLink) {
					event.preventDefault();
					return;
				}

				var targetUrl = new URL(link.href, window.location.href);
				var targetRoute = getRouteKey(targetUrl.href);
				var targetIndex = navOrder.indexOf(targetRoute);
				var navigationDirection = getDirection(activeRoute, targetRoute);

				if (targetUrl.origin !== window.location.origin || targetIndex === -1 || activeIndex === -1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
					return;

				event.preventDefault();
				window.clearTimeout(navigationTimer);

				list.querySelectorAll('.is-liquid-target').forEach(function(item) {
					item.classList.remove('is-liquid-target');
				});
				link.classList.add('is-liquid-target');

				// Mid-flight re-clicks continue from the indicator's current
				// position instead of snapping back to the active link.
				var isMidFlight = !!indicatorAnimation;
				var movementDuration = moveIndicator(
					link,
					true,
					isMidFlight ? null : activeLink,
					isMidFlight ? null : navigationDirection
				);

				navigationTimer = window.setTimeout(function() {
					window.location.href = link.href;
				}, movementDuration + navTiming.navigationBuffer);
			});
		})();

})(jQuery);
