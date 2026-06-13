// Baldinos Rincon — Alpine.js data + page interactivity
// Menu data and the reviews below are sourced from the store's public
// Google Business listing for Baldinos Giant Jersey Subs, 801 S Columbia
// Ave, Rincon, GA 31326 (4.8★, 35 reviews).

function site() {
  return {
    navOpen: false,
    sent: false,
    sending: false,
    error: "",
    tab: "subs",

    tabs: [
      { id: "subs", label: "Subs" },
      { id: "salads", label: "Salads" },
      { id: "catering", label: "Catering" },
    ],

    menu: {
      subs: [
        {
          name: "#24 Italian Battalion",
          desc: "Extra pressed & cooked ham, salami, cappicola, pepperoni & provolone.",
          price: "from $8.69",
          img: "./assets/sub-italian.jpg",
        },
        {
          name: "#19 Steak with Mushrooms",
          desc: "Grilled steak, mushrooms & grilled onions on warm bread.",
          price: "from $8.19",
          img: "./assets/sub-steak.jpg",
        },
        {
          name: "#18 Smoked Turkey & Provolone",
          desc: "Smoked turkey breast and provolone, served the Baldinos Way.",
          price: "from $8.19",
          img: "./assets/sub-turkey.jpg",
        },
      ],
      salads: [
        {
          name: "Italian Salad Plate",
          desc: "Cooked ham, pepperoni, salami, cappicola & provolone over greens.",
          price: "$7.99",
          img: "./assets/salad-garden.jpg",
        },
        {
          name: "American Salad Plate",
          desc: "Turkey, cooked ham, roast beef & provolone over greens.",
          price: "$7.99",
          img: "./assets/salad-chef.jpg",
        },
        {
          name: "Grilled Julienne Chicken",
          desc: "Hot-off-the-grill chicken over crisp greens with deli salad & roll.",
          price: "$8.49",
          img: "./assets/salad-chicken.jpg",
        },
      ],
      catering: [
        {
          name: "Sub Platter",
          desc: "Assorted favorites cut for sharing — perfect for offices and gatherings.",
          price: "Call for pricing",
          img: "./assets/catering-platter.jpg",
        },
        {
          name: "Boxed Lunches",
          desc: "A sub, chips, cookie, and drink packaged for meetings or field days.",
          price: "Call for pricing",
          img: "./assets/catering-boxed.jpg",
        },
        {
          name: "Dessert Tray",
          desc: "Warm cookies and shareable sweets to round out the table.",
          price: "Call for pricing",
          img: "./assets/dessert.jpg",
        },
      ],
    },

    // Real individual Google reviews (top, most recent 5-star reviews).
    reviews: [
      {
        name: "Kenya Baker",
        when: "5★ · 1 month ago",
        text: "The sandwiches are always fresh, well made and huge! The bread is soft and fresh!",
      },
      {
        name: "Terissa McFarland",
        when: "5★ · 2 months ago",
        text: "It has become my absolute FAVORITE sub shop! Always fresh, the bread is soft, and everyone is friendly.",
      },
      {
        name: "Caleb H.",
        when: "5★ · 2 months ago",
        text: "Hands-down my favorite place. The biggest sandwiches I've ever had.",
      },
      {
        name: "Honesty",
        when: "5★ · 2 months ago",
        text: "Very, very clean. Subs made perfectly. Definitely will be back — very friendly staff.",
      },
      {
        name: "Adriaen Monroe",
        when: "5★ · 3 months ago",
        text: "I come here at least once a week. The staff is friendly and my sandwich is always perfect.",
      },
      {
        name: "Cynthia Squire",
        when: "5★ · 4 months ago",
        text: "Love this location. The owners are so friendly — it's the only place I go to for subs.",
      },
    ],

    // Submits the catering form to the store inbox via FormSubmit's AJAX
    // endpoint (delivers to p.purvit2000@gmail.com). No backend required.
    async submitForm(event) {
      if (this.sending) return;
      this.error = "";
      this.sending = true;

      try {
        const response = await fetch(
          "https://formsubmit.co/ajax/p.purvit2000@gmail.com",
          {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(event.target),
          }
        );

        if (!response.ok) throw new Error("bad status");

        this.sending = false;
        this.sent = true;
        event.target.reset();
        window.setTimeout(() => {
          this.sent = false;
        }, 4000);
      } catch (err) {
        this.sending = false;
        this.error =
          "Sorry — something went wrong sending your request. Please call (912) 295-5184.";
      }
    },
  };
}

window.site = site;
