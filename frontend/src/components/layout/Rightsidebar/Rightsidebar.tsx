import "./RightSidebar.css";

const suggestedUsers = [
  {
    id: 1,
    name: "Jane Wanjiku",
    username: "@janew",
    initial: "J",
  },
  {
    id: 2,
    name: "David Kim",
    username: "@davidkim",
    initial: "D",
  },
  {
    id: 3,
    name: "Sarah Achieng",
    username: "@sarah_a",
    initial: "S",
  },
];

export default function RightSidebar() {
  return (
    <aside className="right-sidebar">
      <section className="right-sidebar__section">
        <h2 className="right-sidebar__title">
          Who to follow
        </h2>

        <div className="right-sidebar__users">
          {suggestedUsers.map((user) => (
            <div className="suggested-user" key={user.id}>
              <div className="suggested-user__avatar">
                {user.initial}
              </div>

              <div className="suggested-user__info">
                <strong>{user.name}</strong>
                <span>{user.username}</span>
              </div>

              <button
                className="suggested-user__follow"
                type="button"
              >
                Follow
              </button>
            </div>
          ))}
        </div>

        <button className="right-sidebar__view-more" type="button">
          Show more
        </button>
      </section>

      <section className="right-sidebar__section">
        <h2 className="right-sidebar__title">
          Trending
        </h2>

        <div className="trending-item">
          <span>Trending</span>
          <strong>#Technology</strong>
        </div>

        <div className="trending-item">
          <span>Trending</span>
          <strong>#Kenya</strong>
        </div>

        <div className="trending-item">
          <span>Trending</span>
          <strong>#Community</strong>
        </div>
      </section>
    </aside>
  );
}