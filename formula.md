## 계산에 들어가기 전에

아래 계산식에서

$v_{y,0}(m/tick)$ 는 초기 y축 속력,
$g(m/tick^{2})$ 는 중력 가속,
$d(1/tick)$ 는 공기저항,

을 의미합니다.

또한, $k=1-d$ 입니다.




## Item, FallingBlock, TNT, ExperienceOrb 
ModelGravityMoveDrag


##### y축

매 틱마다 모션에 중력을 더하고 -> 좌표를 모션값만큼 이동시킨 후 -> 모션에 공기저항을 곱합니다.

$t$틱 째에 이동하는 거리 $v_{y,t}$는

$$
v_{y,t} = 
\left\{\begin{matrix}
v_{y,0} (t=1)
\\
v_{y,t-1} \cdot k + g (t>1)
\end{matrix}\right.
= v_{y,0} \cdot k^{t-1} + \frac{g \cdot (1-k^{t})}{(1-k)}
$$

따라서 $t$틱 째에 엔티티의 변위 $\Delta y_{t}$는

$$
\Delta y_{t} = \sum_{n=1}^{t} v_{y,n} = v_{y,0} \cdot \frac{(1-k^{t})}{(1-k)} + \frac{g \cdot t}{(1-k)}- \frac{g \cdot k \cdot (1-k^{t})}{(1-k)^{2}}
$$

이 함수를 약간 변형하면 원하는 시간 $t$, 원하는 변위 $\Delta y_{t}$가 있을 때 초기속도 $v_{y,0}$를 구할 수 있습니다.

$$
v_{y,0} = (\Delta y_{t} - \frac{g \cdot t}{(1-k)} + \frac{g \cdot k \cdot (1-k^{t})}{(1-k)^{2}}) \cdot \frac{(1-k)}{(1-k^{t})}
$$

또, 2번째 함수에 [Newton's method](https://en.wikipedia.org/wiki/Newton%27s_method)를 적용하면 초기 속도, 원하는 변위가 있을 때 소요되는 시간을 쉽게 계산할 수 있습니다.


##### x축, z축
매 틱마다 좌표를 모션값만큼 이동시킨 후 -> 모션에 공기저항을 곱합니다.

y축 수식에서 $g=0$을 대입하면 끝입니다.

$$
\Delta x_{t} = v_{x,0} \cdot \frac{(1-k^{t})}{(1-k)}
$$

$$
v_{x,0} = \Delta x_{t} \cdot \frac{(1-k)}{(1-k^{t})}
$$




## Arrow, Trident, ThrowableEntity(snowballs, enderpearls, etc)
ModelMoveDragGravity


##### y축

매 틱마다 좌표를 모션값만큼 이동시킨 후 -> 모션에 공기저항을 곱하고 -> 모션에 중력을 더합니다.

$t$틱 째에 이동하는 거리 $v_{y,t}$는

$$
v_{y,t} = 
\left\{\begin{matrix}
v_{y,0} (t=1)
\\
v_{y,t-1} \cdot k + g (t>1)
\end{matrix}\right.
= \left\{\begin{matrix}
v_{y,0} (t=1)
\\
v_{y,0} \cdot k^{t-1} + \frac{g \cdot (1-k^{t-1})}{(1-k)} (t>1)
\end{matrix}\right.
$$

따라서 $t$틱 째에 엔티티의 변위 $\Delta y_{t}$는

$$
\Delta y_{t} = \sum_{n=1}^{t} v_{y,n} = v_{y,0} \cdot \frac{(1-k^{t})}{(1-k)} + \frac{g \cdot t}{(1-k)}- \frac{g \cdot (1-k^{t})}{(1-k)^{2}} - g
$$

원하는 시간 $t$, 원하는 변위 $\Delta y_{t}$가 있을 때 초기속도 $v_{y,0}$는

$$
v_{y,0} = (\Delta y_{t} - \frac{g \cdot t}{(1-k)} + \frac{g \cdot (1-k^{t})}{(1-k)^{2}} + g) \cdot \frac{(1-k)}{(1-k^{t})}
$$


##### x축, z축

매 틱마다 좌표를 모션값만큼 이동시킨 후 -> 모션에 공기저항을 곱합니다.

y축 수식에서 $g=0$을 대입하면 끝입니다.

$$
\Delta x_{t} = v_{x,0} \cdot \frac{(1-k^{t})}{(1-k)}
$$

$$
v_{x,0} = \Delta x_{t} \cdot \frac{(1-k)}{(1-k^{t})}
$$




## player, living_entity(monsters, animals)
ModelMoveGravityDrag


##### y축

매 틱마다 좌표를 모션값만큼 이동시킨 후 -> 모션에 중력을 더하고 -> 모션에 공기저항을 곱합니다.

$t$틱 째에 이동하는 거리 $v_{y,t}$는

$$
v_{y,t} = 
\left\{\begin{matrix}
v_{y,0} (t=1)
\\
(v_{y,t-1} + g) \cdot k (t>1)
\end{matrix}\right.
= \left\{\begin{matrix}
v_{y,0} (t=1)
\\
v_{y,0} \cdot k^{t-1} + \frac{g \cdot (1-k^{t})}{(1-k)}-g (t>1)
\end{matrix}\right.
$$

따라서 $t$틱 째에 엔티티의 변위 $\Delta y_{t}$는

$$
\Delta y_{t} = \sum_{n=1}^{t} v_{y,n} = v_{y,0} \cdot \frac{(1-k^{t})}{(1-k)} + \frac{g \cdot t}{(1-k)}- \frac{g \cdot k \cdot (1-k^{t})}{(1-k)^{2}} - g \cdot t
$$

원하는 시간 $t$, 원하는 변위 $\Delta y_{t}$가 있을 때 초기속도 $v_{y,0}$는

$$
v_{y,0} = (\Delta y_{t} - \frac{g \cdot t}{(1-k)} + \frac{g \cdot k \cdot (1-k^{t})}{(1-k)^{2}} + g \cdot t) \cdot \frac{(1-k)}{(1-k^{t})}
$$


##### x축, z축

매 틱마다 좌표를 모션값만큼 이동시킨 후 -> 모션에 공기저항을 곱합니다.

y축 수식에서 $g=0$을 대입하면 끝입니다.

$$
\Delta x_{t} = v_{x,0} \cdot \frac{(1-k^{t})}{(1-k)}
$$

$$
v_{x,0} = \Delta x_{t} \cdot \frac{(1-k)}{(1-k^{t})}
$$