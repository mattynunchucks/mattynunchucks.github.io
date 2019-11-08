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
          unlockNext: 15,
          upgradeMultiplier: 1
        },
        {
          name: "Peasants",
          total: 0,
          unlocked: false,
          cost: 15,
          incrementBy: 0.4,
          unlockNext: 30,
          upgradeMultiplier: 1
        },
        {
          name: "Farmers",
          total: 0,
          unlocked: false,
          cost: 30,
          incrementBy: 0.3,
          unlockNext: 45,
          upgradeMultiplier: 1
        },
        {
          name: "Blacksmith",
          total: 0,
          unlocked: false,
          cost: 45,
          incrementBy: 0.2,
          unlockNext: 60,
          upgradeMultiplier: 1
        },
        {
          name: "Knights",
          total: 0,
          unlocked: false,
          cost: 60,
          incrementBy: 0.15,
          unlockNext: 75,
          upgradeMultiplier: 1
        }
      ],
      upgradeArray: [
        {
          name: "Gold Doubler",
          cost: 100,
          affects: "Gold",
          affectsIndex: 0,
          bought: false,
          value: 2,
          visible: true
        },
        {
          name: "Peasant Doubler",
          cost: 500,
          affects: "Peasants",
          affectsIndex: 1,
          bought: false,
          value: 2,
          visible: true
        },
        {
          name: "Farmer Doubler",
          cost: 1500,
          affects: "Farmer",
          affectsIndex: 2,
          bought: false,
          value: 2,
          visible: true
        },
        {
          name: "Blacksmith Doubler",
          cost: 5000,
          affects: "Blacksmiths",
          affectsIndex: 3,
          bought: false,
          value: 2,
          visible: true
        },
        {
          name: "Knight Doubler",
          cost: 10000,
          affects: "Knights",
          affectsIndex: 4,
          bought: false,
          value: 2,
          visible: true
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

  incrementer() {
    let clickerArray = this.state.clickerArray;
    let clickerArrayLength = clickerArray.length;

    this.state.clickerArray.map((clickElement, index) => {
      if (index + 1 < clickerArrayLength) {
        if (
          this.state.clickerArray[index + 1].unlocked &&
          this.state.clickerArray[index + 1].total > 0
        ) {
          clickElement.total =
            clickElement.total +
            this.state.clickerArray[index + 1].total *
              (clickElement.incrementBy * clickElement.upgradeMultiplier);
        }
        this.setState(prevState => {
          return { clickerArray: this.state.clickerArray };
        });
      }
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

  buyUpgrade(index) {
    let upgradeElement = this.state.upgradeArray[index];
    let upgradeCost = upgradeElement.cost;
    let upgradeValue = upgradeElement.value;
    let upgradeAffectsIndex = upgradeElement.affectsIndex;
    let goldElement = this.state.clickerArray[0];
    if (goldElement.total >= upgradeCost) {
      this.setNewTotal(0, -upgradeElement.cost);
      upgradeElement.visible = false;
      upgradeElement.bought = true;
      this.setNewUpgradeMultiplier(upgradeAffectsIndex, upgradeValue);
      this.setState({
        clickerArray: this.state.clickerArray,
        upgradeArray: this.state.upgradeArray
      });
    }
  }

  setNewUpgradeMultiplier(index, delta) {
    let clickElement = this.state.clickerArray[index];
    clickElement.total = clickElement.total + delta;
    clickElement.upgradeMultiplier = clickElement.upgradeMultiplier + delta;
    this.setState({
      clickerArray: this.state.clickerArray
    });
  }

  checkForUnlocks() {
    let clickerArray = this.state.clickerArray;
    let upgradeArray = this.state.upgradeArray;
    clickerArray.forEach(
      clickElement =>
        (clickElement.unlocked = clickElement.total >= clickElement.unlockNext)
    );
    let goldElement = this.state.clickerArray[0];
    upgradeArray.forEach(
      upgradeElement =>
        (upgradeElement.visible = goldElement.total >= upgradeElement.cost)
    );
    this.setState({
      clickerArray: this.state.clickerArray,
      upgradeArray: this.state.upgradeArray
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
        {this.state.upgradeArray.map((upgradeElement, index) => (
          <div className={upgradeElement.name} key={upgradeElement.name}>
            {upgradeElement.visible && (
              <button
                id={upgradeElement.name}
                onClick={() => this.buyUpgrade(index)}
              >
                {upgradeElement.name}: {upgradeElement.cost} Gold
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("app"));
