window.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.navbar-right .nav-link');
  links.forEach(link => {
    if(link.href === window.location.href) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

