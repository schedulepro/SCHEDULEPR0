// 🌐 Sidebar active link highlight only
const sidebar = document.getElementById('sidebar');

if (sidebar) {
  const links = sidebar.querySelectorAll('a');
  const currentPage = window.location.pathname.split("/").pop(); // e.g. "dashboard.html"

  links.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref.endsWith(currentPage)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}