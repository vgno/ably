## Architecture

Ably contains a collection of *experiments*.

Each *experiment* has its own *sampler* and its own *scope*.

### Sampler ###

A sampler assigns test subjects to groups.

### Scope

A scope marks the boundary of where the experiment begins and where it ends.

### Why HTML & CSS APIs?

It is possible to implement any A/B test using the JS API only.

Using the HTML & CSS APIs is recommended when you want to vary **content** or **styling**.

#### Performance
   
   Using the HTML & CSS APIs offloads variation of content and styling to the browser. It empowers the browser to style elements while the DOM is still parsed which helps avoid the lag related to manipulation of DOM elements via JavaScript. 

#### Separation of concerns

   Using the HTML & CSS APIs allows to keep content and styling with other content and styling.
