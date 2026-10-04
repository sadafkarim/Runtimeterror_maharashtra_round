import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FanHeader from "./FanHeader"
import Countdown from './Countdown'
import { fetchEventById } from '../api/events'
import { getUser } from '../api/auth'

const DROP_LABELS = {
  SCHEDULED: "Scheduled",
  OPEN: "Open now",
  CLOSED: "Closed",
  ALLOCATING: "Selecting winners",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const METHOD_LABELS = {
  BATCHED_RANDOM: "Random draw after the drop closes",
};

const fmtDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const fmtTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function DetailsSkeleton() {
  return (
    <div className="detail-grid" aria-busy="true" aria-label="Loading event">
      <div>
        <div className="skeleton detail-hero-skel" />
        <div className="skeleton skeleton-line w-70" style={{ marginTop: 24, height: 28 }} />
        <div className="skeleton skeleton-line w-100" style={{ marginTop: 16 }} />
        <div className="skeleton skeleton-line w-40" style={{ marginTop: 12 }} />
      </div>
      <div className="skeleton drop-skel" />
    </div>
  );
}

function DropPanel({ drop, user, eventId }) {
  const dropPath = `/drops/${drop.id}`;
  const loginPath = `/login?redirect=${encodeURIComponent(dropPath)}`;

  let action;
  switch (drop.status) {
    case "OPEN":
      action = (
        <Link to={user ? dropPath : loginPath} className="btn btn-signal btn-wide">
          {user ? "Join drop" : "Log in to join"}
        </Link>
      );
      break;
    case "SCHEDULED":
      action = (
        <button type="button" className="btn btn-dark btn-wide" disabled>
          Drop not open yet
        </button>
      );
      break;
    case "CLOSED":
      action = (
        <button type="button" className="btn btn-dark btn-wide" disabled>
          Drop closed
        </button>
      );
      break;
    case "ALLOCATING":
      action = (
        <button type="button" className="btn btn-dark btn-wide" disabled>
          Selecting winners...
        </button>
      );
      break;
    case "COMPLETED":
      action = (
        <Link to={user ? dropPath : loginPath} className="btn btn-dark btn-wide">
          {user ? "See my result" : "Log in to see your result"}
        </Link>
      );
      break;
    default:
      action = (
        <button type="button" className="btn btn-dark btn-wide" disabled>
          Drop cancelled
        </button>
      );
  }

  return (
    <aside className="drop-panel" aria-label="Ticket drop">
      <div className="drop-panel-top">
        <span className={`drop-status drop-${drop.status.toLowerCase()}`}>
          {DROP_LABELS[drop.status]}
        </span>
        <h2 className="drop-name">{drop.name}</h2>
      </div>

      {drop.status === "SCHEDULED" && <Countdown to={drop.opensAt} label="Drop opens in" />}
      {drop.status === "OPEN" && <Countdown to={drop.closesAt} label="Drop closes in" />}

      <dl className="drop-facts">
        <div>
          <dt>Tickets available</dt>
          <dd>{drop.ticketCount}</dd>
        </div>
        <div>
          <dt>Opens</dt>
          <dd>{fmtTime(drop.opensAt)}</dd>
        </div>
        <div>
          <dt>Closes</dt>
          <dd>{fmtTime(drop.closesAt)}</dd>
        </div>
        <div>
          <dt>How winners are picked</dt>
          <dd>{METHOD_LABELS[drop.allocationMethod] || drop.allocationMethod}</dd>
        </div>
      </dl>

      {action}

      <p className="drop-note">
        You get one entry per drop. Clicking more than once doesn't improve your odds.
      </p>
    </aside>
  );
}

export default function EventDetails() {
  const { eventId } = useParams();
  const user = getUser();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorCode("");

    fetchEventById(eventId)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setErrorCode(err.code || "INTERNAL_ERROR");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, reloadKey]);

  return (
    <div className="fan-page">
      <FanHeader />

      <main className="fan-main">
        <Link to="/events" className="back-link">
          Back to events
        </Link>

        {loading && <DetailsSkeleton />}

        {!loading && errorCode === "EVENT_NOT_FOUND" && (
          <div className="state-box">
            <h2 className="state-title">We can't find that event</h2>
            <p className="state-text">It may have been removed, or the link is wrong.</p>
            <Link to="/events" className="btn btn-dark">
              Browse events
            </Link>
          </div>
        )}

        {!loading && errorCode && errorCode !== "EVENT_NOT_FOUND" && (
          <div className="state-box" role="alert">
            <h2 className="state-title">Event didn't load</h2>
            <p className="state-text">Something went wrong on our side. Try again in a moment.</p>
            <button type="button" className="btn btn-dark" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </div>
        )}

        {!loading && !errorCode && data && (
          <div className="detail-grid">
            <section>
              <div className="detail-hero">
                <span className="detail-hero-date">{data.event.date.slice(8)}</span>
                <span className="detail-hero-month">
                  {new Date(data.event.date + "T00:00:00").toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h1 className="detail-title">{data.event.name}</h1>
              <p className="detail-desc">{data.event.description}</p>

              <dl className="detail-facts">
                <div>
                  <dt>Date</dt>
                  <dd>{fmtDate(data.event.date)}</dd>
                </div>
                <div>
                  <dt>Doors open</dt>
                  <dd>{data.event.startTime}</dd>
                </div>
                <div>
                  <dt>Venue</dt>
                  <dd>{data.event.venue}</dd>
                </div>
                <div>
                  <dt>Total seats</dt>
                  <dd>{data.event.totalTickets}</dd>
                </div>
              </dl>
            </section>

            {data.drop ? (
              <DropPanel drop={data.drop} user={user} eventId={data.event.id} />
            ) : (
              <aside className="drop-panel">
                <h2 className="drop-name">No drop scheduled yet</h2>
                <p className="state-text" style={{ margin: 0 }}>
                  Tickets for this event aren't on sale yet. Check back soon.
                </p>
              </aside>
            )}
          </div>
        )}
      </main>
    </div>
  );
}