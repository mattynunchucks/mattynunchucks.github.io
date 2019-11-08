import ReactDOM from "react-dom";
import React, { Component } from "react";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clickerArray: [
        {
          name: "Gold",
          total: 0,
          unlocked: true,
          cost: 0,
          incrementBy: 0.5,
          unlockNext: 15
        },
        {
          name: "Peasants",
          total: 0,
          unlocked: false,
          cost: 15,
          incrementBy: 0.4,
          unlockNext: 30
        },
        {
          name: "Farmers",
          total: 0,
          unlocked: false,
          cost: 30,
          incrementBy: 0.3,
          unlockNext: 45
        },
        {
          name: "Blacksmith",
          total: 0,
          unlocked: false,
          cost: 45,
          incrementBy: 0.2,
          unlockNext: 60
        },
        {
          name: "Knights",
          total: 0,
          unlocked: false,
          cost: 60,
          incrementBy: 0.15,
          unlockNext: 75
        }
      ]
    };
  }
  componentDidMount() {
    this.interval = setInterval(() => this.incrementer(), 500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  setGold(goldDelta) {
    this.setState(prevState => {
      return { gold: prevState.gold + goldDelta };
    });
  }

  incrementer() {
    this.state.clickerArray.map((clickElement, index) => {
      if (
        index + 1 <= this.state.clickerArray.length &&
        this.state.clickerArray[index + 1].unlocked &&
        this.state.clickerArray[index + 1].total > 0
      ) {
        clickElement.total =
          clickElement.total +
          this.state.clickerArray[index + 1].total * clickElement.incrementBy;
      }
      this.setState(prevState => {
        return { clickerArray: this.state.clickerArray };
      });
    });
  }

  buyClicker(index, delta) {
    let clickElement = this.state.clickerArray[index];
    if (index !== 0) {
      let clickElementPrevious = this.state.clickerArray[index - 1];
      if (clickElementPrevious.total >= clickElement.cost) {
        this.setNewTotal(index - 1, -clickElement.cost);
        this.setNewTotal(index, delta);
      }
    } else {
      this.setNewTotal(index, delta);
    }
  }

  setNewTotal(index, delta) {
    let clickElement = this.state.clickerArray[index];
    clickElement.total = clickElement.total + delta;
    if (clickElement.total >= clickElement.unlockNext) {
      let clickElementNext = this.state.clickerArray[index + 1];
      clickElementNext.unlocked = true;
    }
    this.setState({
      clickerArray: this.state.clickerArray
    });
  }

  checkForUnlocks() {
    let clickerArray = this.state.clickerArray;
    clickerArray.forEach(
      clickElement =>
        (clickElement.unlocked = clickElement.total >= clickElement.unlockNext)
    );
    this.setState({
      clickerArray: this.state.clickerArray
    });
  }

  render() {
    return (
      <div className="game">
        <div className="buttons">
          {this.state.clickerArray.map((clickElement, index) => (
            <div className={clickElement.name} key={clickElement.name}>
              {clickElement.unlocked && (
                <button
                  id={clickElement.name}
                  onClick={() => this.buyClicker(index, 1)}
                >
                  {clickElement.name}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="resources">
          {this.state.clickerArray.map((clickElement, index) => (
            <div className={clickElement.name} key={clickElement.name}>
              {clickElement.unlocked && (
                <div>
                  {clickElement.name}: {clickElement.total.toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="upgrades" />
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("app"));
