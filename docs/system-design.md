# Overview

## Assembly specification

### Types

```ocaml
type partId = string (* Each partId needs to be unique within an assembly *)
type name = string
type param = int | float | string
```

```ocaml
type assembly = 
| GraphAssembly of {
    parts: [(partId, part)] with partId unique,
    joints: [(partId, partId, joint)],
}
| OneToMany of {
    main: part,
    secondary: part,
    connection: joint,
    count: int,
}
| Serialize of {
    part: part,
    connection: joint,
    count: int
}
```

```ocaml
type jointEndpoint = {origin: point, orientation: matrix}
```

```ocaml
type partInstance = {
    partId: partId,
    part: part,
    parameters of [(name, param)]
}
```

```ocaml
type part =
| Module of {
    partSource: string, 
    contractSource: string,
    jointEndpoints: [jointEndpoint]
}
| Asset of {
    source: string
    jointEndpoints: [jointEndpoint]
}
| Assembly of assembly
```

```ocaml
type contract = 
```

```ocaml
type joint {
    id_a: id,
    id_b: id,
    endpoint_a: Anchor of {origin: point, orientation: matrix},
    endpoint_b: Anchor of {origin: point, orientation: matrix},
}
```

### Repeat

Instead of having to write:

```json
{
    parts: [
        {
            partId: base_platform,
            partSource: cad_modules/base_platform.py:create_base
            contractSource: cad_modules/base_platform.py:create_base_contract
        },
        {
            partId: leg_1,
            partSource: cad_modules/base_platform.py:create_leg
            contractSource: cad_modules/base_platform.py:create_leg_contract
            parameters: [
                ("leg_length", 10)
            ]
        },
        {
            partId: leg_2,
            partSource: cad_modules/base_platform.py:create_leg
            contractSource: cad_modules/base_platform.py:create_leg_contract
            parameters: [
                ("leg_length", 10)
            ]
        },
        {
            partId: leg_3,
            partSource: cad_modules/base_platform.py:create_leg
            contractSource: cad_modules/base_platform.py:create_leg_contract
            parameters: [
                ("leg_length", 10)
            ]
        },
        {leg_4
            partId: ,
            partSource: cad_modules/base_platform.py:create_leg
            contractSource: cad_modules/base_platform.py:create_leg_contract
            parameters: [
                ("leg_length", 10)
            ]
        },
    ],
}
```

we write: 

```json
{
    parts: [
        {
            partId: base_platform,
            partSource: cad_modules/base_platform.py:create_base
            contractSource: cad_modules/base_platform.py:create_base_contract
        },
        {
            repeatPart: {
                count: 4,
                index: i,
                partId: leg_${i},
                partSource: cad_modules/base_platform.py:create_leg
                contractSource: cad_modules/base_platform.py:create_leg_contract
                parameters: [
                    ("leg_length", 10)
                ]
            }
        },
    ],
    joints: [

    ]
}
```