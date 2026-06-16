import React from 'react';
import { useGameStore } from '../store/gameStore';
import '../styles/ResultsScreen.css';

/**
 * Results/leaderboard screen after match ends
 */
const ResultsScreen: React.FC = () => {
  const { gameState, setScreen } = useGameStore();

  const leaderboard = gameState?.players
    ?.sort((a, b) => (a.finishTime ?? Infinity) - (b.finishTime ?? Infinity))
    .map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      time: p.finishTime ? `${(p.finishTime / 1000).toFixed(2)}s` : 'DNF',
      color: p.color,
    })) ?? [];

  return (
    <div className="results-screen">
      <div className="results-container">
        <h1 className="results-title">🏁 Match Complete!</h1>

        <div className="leaderboard">
          <h2>Final Results</h2>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={idx} className={`rank-${entry.rank}`}>
                  <td className="rank-cell">
                    {entry.rank === 1 && '🥇'}
                    {entry.rank === 2 && '🥈'}
                    {entry.rank === 3 && '🥉'}
                    {entry.rank > 3 && entry.rank}
                  </td>
                  <td className="player-cell">
                    <div
                      className="player-color-dot"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}
                  </td>
                  <td className="time-cell">{entry.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="results-actions">
          <button className="btn btn-primary" onClick={() => setScreen('lobby')}>
            Play Again
          </button>
          <button className="btn btn-secondary" onClick={() => setScreen('main-menu')}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
