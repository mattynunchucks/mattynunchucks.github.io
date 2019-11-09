import ReactDOM from "react-dom";
import React, { Component } from "react";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clickMultiplesArray: [10, 100, 1000],
      clickerArray: [
        {
          name: "Gold",
          total: 0,
          unlocked: true,
          cost: 0,
          costs: "",
          incrementBy: 0.5,
          unlockNext: 15,
          upgradeMultiplier: 1
        },
        {
          name: "Peasants",
          total: 0,
          unlocked: false,
          cost: 15,
          costs: "Gold",
          incrementBy: 0.4,
          unlockNext: 30,
          upgradeMultiplier: 1
        },
        {
          name: "Farmers",
          total: 0,
          unlocked: false,
          cost: 30,
          costs: "Peasants",
          incrementBy: 0.3,
          unlockNext: 45,
          upgradeMultiplier: 1
        },
        {
          name: "Blacksmith",
          total: 0,
          unlocked: false,
          cost: 45,
          costs: "Farmers",
          incrementBy: 0.2,
          unlockNext: 60,
          upgradeMultiplier: 1
        },
        {
          name: "Knights",
          total: 0,
          unlocked: false,
          cost: 60,
          costs: "Blacksmiths",
          incrementBy: 0.15,
          unlockNext: 200,
          upgradeMultiplier: 1
        },
        {
          name: "Baron",
          total: 0,
          unlocked: false,
          cost: 200,
          costs: "Knights",
          incrementBy: 0.1,
          unlockNext: 1000,
          upgradeMultiplier: 1
        },
        {
          name: "Earl",
          total: 0,
          unlocked: false,
          cost: 1000,
          costs: "Barons",
          incrementBy: 0.1,
          unlockNext: 10000,
          upgradeMultiplier: 1
        },
        {
          name: "Count",
          total: 0,
          unlocked: false,
          cost: 10000,
          costs: "Earls",
          incrementBy: 0.1,
          unlockNext: 100000,
          upgradeMultiplier: 1
        }
      ],
      upgradeArray: [
        {
          name: "Gold Booster",
          cost: 1000,
          affects: "Gold",
          affectsIndex: 0,
          bought: false,
          value: 0.25,
          visible: true
        },
        {
          name: "Peasant Booster",
          cost: 5000,
          affects: "Peasants",
          affectsIndex: 1,
          bought: false,
          value: 0.25,
          visible: true
        },
        {
          name: "Farmer Booster",
          cost: 15000,
          affects: "Farmer",
          affectsIndex: 2,
          bought: false,
          value: 0.25,
          visible: true
        },
        {
          name: "Blacksmith Booster",
          cost: 50000,
          affects: "Blacksmiths",
          affectsIndex: 3,
          bought: false,
          value: 0.25,
          visible: true
        },
        {
          name: "Knight Booster",
          cost: 100000,
          affects: "Knights",
          affectsIndex: 4,
          bought: false,
          value: 0.25,
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
      if (clickElementPrevious.total >= clickElement.cost * delta) {
        this.setNewTotal(index - 1, -clickElement.cost * delta);
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
            <div>
              <div className={clickElement.name} key={clickElement.name}>
                {clickElement.unlocked && (
                  <div>
                    <button
                      className={index === 0 ? "gold-button" : "click-button"}
                      id={clickElement.name}
                      onClick={() => this.buyClicker(index, 1)}
                      disabled={
                        index > 0 &&
                        this.state.clickerArray[index - 1].total <
                          clickElement.cost
                      }
                    >
                      {clickElement.name} ({clickElement.total.toFixed(2)})
                      {index > 0 && (
                        <p className="click-button-cost">
                          {clickElement.cost} {clickElement.costs}
                        </p>
                      )}
                    </button>
                    <div className="multiple-click-container">
                      {index > 0 &&
                        this.state.clickMultiplesArray.map(multiple => (
                          <button
                            className="multiple-click-button"
                            id={clickElement.name}
                            onClick={() => this.buyClicker(index, multiple)}
                            disabled={
                              this.state.clickerArray[index - 1].total <=
                              clickElement.cost * multiple
                            }
                          >
                            {multiple}x
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="upgrades">
          {this.state.upgradeArray.map((upgradeElement, index) => (
            <div className={upgradeElement.name} key={upgradeElement.name}>
              {upgradeElement.visible && (
                <button
                  className="upgrade-button"
                  id={upgradeElement.name}
                  onClick={() => this.buyUpgrade(index)}
                  disabled={
                    this.state.clickerArray[0].total < upgradeElement.cost
                  }
                >
                  {upgradeElement.name}:{" "}
                  <p className="click-button-cost">
                    {upgradeElement.cost} Gold
                  </p>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("app"));
