const sections = [ { offsetTop: 0 }, { offsetTop: 800 }, { offsetTop: 1600 }, { offsetTop: 2400 } ];
const navLinks = [
    { name: 'Home', width: 60, left: 10 },
    { name: 'Projects', width: 80, left: 80 },
    { name: 'About', width: 60, left: 170 }
];

const navItems = [
    { section: sections[0], link: navLinks[0] },
    { section: sections[1], link: navLinks[0] },
    { section: sections[2], link: navLinks[1] },
    { section: sections[3], link: navLinks[2] }
];

navItems.forEach(item => { item.offsetTop = item.section.offsetTop; });

function simulateScroll(scrollTop) {
    let startIndex = 0, endIndex = 0, t = 0;
    for (let i = 0; i < navItems.length; i++) {
        if (i === navItems.length - 1) {
            startIndex = i; endIndex = i; t = 0; break;
        }
        if (scrollTop >= navItems[i].offsetTop && scrollTop < navItems[i+1].offsetTop) {
            startIndex = i; endIndex = i + 1;
            let sectionHeight = navItems[i+1].offsetTop - navItems[i].offsetTop;
            if (sectionHeight > 0) t = (scrollTop - navItems[i].offsetTop) / sectionHeight;
            break;
        }
    }
    
    const startItem = navItems[startIndex];
    const endItem = navItems[endIndex];
    const startLeft = startItem.link.left;
    const endLeft = endItem.link.left;
    const currentLeft = startLeft + (endLeft - startLeft) * t;
    
    console.log(`scrollTop: ${scrollTop} -> StartItem: ${startItem.link.name}, EndItem: ${endItem.link.name}, t: ${t.toFixed(2)}, left: ${currentLeft.toFixed(1)}`);
}

for (let s = 0; s <= 2400; s += 200) {
    simulateScroll(s);
}
